/**
 * Imports Italy's month-end stocks of wine, must and new wine from the
 * ICQRF's Cantina Italia reports into public.supply_figures: wine with a
 * PDO and with a PGI by colour, varietal and other wine, must that is not
 * concentrated, concentrated and rectified concentrated must, and new
 * wine still in fermentation, national totals in hectolitres, one
 * month's report per run.
 *
 * The database decides what runs: private.start_cantina_italia_imports()
 * queues one run per closing month in public.import_runs and posts each
 * id here. This function executes only a queued run, so a stray call can
 * at most start an import that was due anyway. It answers at once and
 * imports in the background, recording the outcome on the run. One
 * spreadsheet per run keeps the parsing within the function's CPU time.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.2";

import {
  fetchSpreadsheet,
  type Figure,
  figures,
  FIRST_MONTH,
  listingYear,
  listReports,
  reportClosing,
  SOURCE_ID,
  spreadsheetUrl,
} from "./cantina.ts";

const COUNTRY = "IT";

/** The month whose closing stocks a run imports. */
interface Job {
  year: number;
  month: number;
}

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

function reply(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** "2024-03" for March 2024. */
function monthKey(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, "0")}`;
}

/** The last month that has ended, the latest whose report can be out. */
function lastClosedMonth(): string {
  const date = new Date();
  date.setUTCDate(0);
  return date.toISOString().slice(0, 7);
}

function parseJob(value: unknown): Job | null {
  if (typeof value !== "object" || value === null) return null;
  const { year, month } = value as Record<string, unknown>;
  if (
    typeof year !== "number" ||
    !Number.isInteger(year) ||
    typeof month !== "number" ||
    !Number.isInteger(month) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }
  const key = monthKey(year, month);
  if (key < FIRST_MONTH || key > lastClosedMonth()) return null;
  return { year, month };
}

async function finish(
  runId: number,
  outcome: Record<string, unknown>,
  from: "queued" | "running" = "running",
): Promise<void> {
  const { error } = await supabase
    .from("import_runs")
    .update({ ...outcome, finished_at: new Date().toISOString() })
    .eq("id", runId)
    .eq("status", from);
  if (error) {
    console.error(`Could not record the outcome of run ${runId}:`, error.message);
  }
}

function key(figure: Pick<Figure, "product" | "colour">): string {
  return `${figure.product} ${figure.colour}`;
}

async function importRun(runId: number, job: Job, startedAt: string): Promise<void> {
  const month = monthKey(job.year, job.month);
  const period = `${month}-01`;
  try {
    const year = listingYear(month);
    const listed = await listReports(year);
    const now = new Date();
    // A listing naming no report at all has changed shape, unless it is
    // this year's and the year has barely begun.
    if (listed.length === 0 && !(year === now.getUTCFullYear() && now.getUTCMonth() < 2)) {
      throw new Error(`The MASAF listing for ${year} names no Cantina Italia report`);
    }
    const report = reportClosing(listed, month);
    if (!report) {
      // A month's report comes out 8 to 12 days after the month ends,
      // and the ministry publishes none for some Augusts.
      await finish(runId, {
        status: "succeeded",
        rows_upserted: 0,
        rows_deleted: 0,
        note: `MASAF's ${year} listing names no month-end Cantina Italia report closing ${month}.`,
      });
      return;
    }

    const url = await spreadsheetUrl(report.pageUrl);
    if (!url) throw new Error(`The report of ${report.referenceDate} links no spreadsheet`);
    const { file, uploadedAt } = await fetchSpreadsheet(url);
    const monthFigures = figures(file, report.referenceDate, period);
    // The figures are published on the day the listing gives the report;
    // without that date, when the file was uploaded or this run found it.
    const listedOn = report.publishedOn ? `${report.publishedOn}T00:00:00Z` : null;
    const published = listedOn ?? uploadedAt;
    const publishedAt = published && published < startedAt ? published : startedAt;

    const { data: stored, error: readError } = await supabase
      .from("supply_figures")
      .select("product, colour, volume_hl, published_at")
      .eq("country", COUNTRY)
      .eq("source_id", SOURCE_ID)
      .eq("period", period);
    if (readError) throw new Error(`Reading stored figures failed: ${readError.message}`);
    const known = new Map(stored.map((row) => [key(row), row]));

    // New figures are added as published; a figure whose volume changed
    // is a revision and keeps its original publication time.
    let revised = 0;
    const rows = monthFigures.flatMap((figure) => {
      const previous = known.get(key(figure));
      if (previous && Math.abs(Number(previous.volume_hl) - figure.volume_hl) < 0.5) {
        return [];
      }
      if (previous) revised++;
      return [{
        ...figure,
        country: COUNTRY,
        source_id: SOURCE_ID,
        published_at: previous?.published_at ?? publishedAt,
        updated_at: startedAt,
        revised: previous !== undefined,
      }];
    });
    if (rows.length > 0) {
      const { error } = await supabase
        .from("supply_figures")
        .upsert(rows, {
          onConflict: "country,period,measure,product,colour,presentation,holder",
        });
      if (error) throw new Error(`Saving ${month} failed: ${error.message}`);
    }

    await finish(runId, {
      status: "succeeded",
      rows_upserted: rows.length,
      rows_deleted: 0,
      note: revised > 0
        ? `${revised} of ${monthFigures.length} figures revised since the last import.`
        : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Cantina Italia run ${runId} failed:`, message);
    await finish(runId, { status: "failed", error: message.slice(0, 1000) });
  }
}

Deno.serve(async (request) => {
  if (request.method !== "POST") return reply({ error: "Use POST" }, 405);

  let body: { run_id?: unknown } | null;
  try {
    body = await request.json();
  } catch {
    return reply({ error: "The body must be JSON" }, 400);
  }
  const runId = body?.run_id;
  if (typeof runId !== "number" || !Number.isSafeInteger(runId) || runId < 1) {
    return reply({ error: "run_id must be a positive integer" }, 400);
  }

  // Claim the run: only a queued run of this source moves to running, and
  // once.
  const startedAt = new Date().toISOString();
  const { data: run, error } = await supabase
    .from("import_runs")
    .update({ status: "running", started_at: startedAt })
    .eq("id", runId)
    .eq("source_id", SOURCE_ID)
    .eq("status", "queued")
    .select("id, job")
    .maybeSingle();
  if (error?.code === "23505") {
    // import_runs_one_running_idx: this month is already being imported.
    await finish(
      runId,
      { status: "failed", error: "Another run for this scope was in progress" },
      "queued",
    );
    return reply({ error: "Another run for this scope is in progress" }, 409);
  }
  if (error) {
    console.error(`Could not claim run ${runId}:`, error.message);
    return reply({ error: "Could not claim the run" }, 500);
  }
  if (!run) return reply({ error: "No queued Cantina Italia run with this id" }, 404);

  const job = parseJob(run.job);
  if (!job) {
    await finish(run.id, { status: "failed", error: "Invalid job" });
    return reply({ error: "Invalid job" }, 422);
  }

  EdgeRuntime.waitUntil(importRun(run.id, job, startedAt));
  return reply({ run_id: run.id, status: "running" }, 202);
});
