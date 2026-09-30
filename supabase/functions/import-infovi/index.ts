/**
 * Imports Spain's monthly wine stocks, production, entries and exits from
 * the Ministry of Agriculture's INFOVI summaries into
 * public.supply_figures: stocks of wine and must at the end of each month,
 * wine made since 1 August, and wine that came in or went out during the
 * month by origin and destination, national totals in hectolitres, from
 * the monthly workbooks of one year.
 *
 * The database decides what runs: private.start_infovi_imports() queues
 * one run per year in public.import_runs and posts its id here. This
 * function executes only a queued run, so a stray call can at most start
 * an import that was due anyway. It answers at once and imports in the
 * background, recording the outcome on the run.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.2";

import {
  fetchWorkbook,
  type Figure,
  figures,
  FIRST_YEAR,
  monthlyWorkbooks,
  SOURCE_ID,
  yearPageUrl,
} from "./infovi.ts";

const COUNTRY = "ES";
/** Workbooks downloaded at a time, to spare the ministry's server. */
const PARALLEL_DOWNLOADS = 3;
const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface Job {
  year: number;
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

function parseJob(value: unknown): Job | null {
  if (typeof value !== "object" || value === null) return null;
  const { year } = value as Record<string, unknown>;
  if (
    typeof year !== "number" ||
    !Number.isInteger(year) ||
    year < FIRST_YEAR ||
    year > new Date().getUTCFullYear()
  ) {
    return null;
  }
  return { year };
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

/** Runs `task` over `items`, at most `limit` at a time, keeping their order. */
async function inBatches<T, R>(
  items: T[],
  limit: number,
  task: (item: T) => Promise<R>,
): Promise<R[]> {
  const results: R[] = [];
  for (let start = 0; start < items.length; start += limit) {
    results.push(...(await Promise.all(items.slice(start, start + limit).map(task))));
  }
  return results;
}

function key(figure: Pick<Figure, "period" | "measure" | "product" | "colour" | "presentation">) {
  return [figure.period, figure.measure, figure.product, figure.colour, figure.presentation]
    .join(" ");
}

async function importRun(
  runId: number,
  job: Job,
  startedAt: string,
): Promise<void> {
  const isCurrentYear = job.year === new Date().getUTCFullYear();
  try {
    const pageUrl = await yearPageUrl(job.year);
    const workbooks = pageUrl ? await monthlyWorkbooks(job.year, pageUrl) : [];
    if (workbooks.length === 0) {
      // The first workbook of a year appears in February or March.
      if (isCurrentYear) {
        await finish(runId, {
          status: "succeeded",
          rows_upserted: 0,
          rows_deleted: 0,
          note: `MAPA has published no INFOVI workbook for ${job.year} yet.`,
        });
        return;
      }
      throw new Error(`The MAPA pages list no INFOVI workbook for ${job.year}`);
    }

    // Each month's figures are published when the workbook that first
    // carries them is uploaded; without that date, when this run found it.
    const months = await inBatches(workbooks, PARALLEL_DOWNLOADS, async ({ month, url }) => {
      const { file, uploadedAt } = await fetchWorkbook(url);
      return {
        month,
        figures: figures(file, job.year, month),
        publishedAt: uploadedAt && uploadedAt < startedAt ? uploadedAt : startedAt,
      };
    });

    const { data: stored, error: readError } = await supabase
      .from("supply_figures")
      .select("period, measure, product, colour, presentation, volume_hl, published_at")
      .eq("country", COUNTRY)
      .eq("source_id", SOURCE_ID)
      .gte("period", `${job.year}-01-01`)
      .lte("period", `${job.year}-12-01`);
    if (readError) throw new Error(`Reading stored figures failed: ${readError.message}`);
    const known = new Map(stored.map((row) => [key(row as Figure), row]));

    // New figures are added as published; a figure whose volume changed
    // is a revision and keeps its original publication time.
    let revised = 0;
    let count = 0;
    const rows = months.flatMap(({ figures: monthFigures, publishedAt }) =>
      monthFigures.flatMap((figure) => {
        count++;
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
      })
    );
    if (rows.length > 0) {
      const { error } = await supabase
        .from("supply_figures")
        .upsert(rows, {
          onConflict: "country,period,measure,product,colour,presentation",
        });
      if (error) throw new Error(`Saving ${job.year} failed: ${error.message}`);
    }

    const notes: string[] = [];
    const found = new Set(months.map(({ month }) => month));
    const missing = MONTH_NAMES.filter((_, index) => !found.has(index + 1));
    if (!isCurrentYear && missing.length > 0) {
      notes.push(`No workbook for ${missing.join(", ")} ${job.year}.`);
    }
    if (revised > 0) {
      notes.push(`${revised} of ${count} figures revised since the last import.`);
    }
    await finish(runId, {
      status: "succeeded",
      rows_upserted: rows.length,
      rows_deleted: 0,
      note: notes.length > 0 ? notes.join(" ") : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`INFOVI run ${runId} failed:`, message);
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

  // Claim the run: only a queued INFOVI run moves to running, and once.
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
    // import_runs_one_running_idx: this year is already being imported.
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
  if (!run) return reply({ error: "No queued INFOVI run with this id" }, 404);

  const job = parseJob(run.job);
  if (!job) {
    await finish(run.id, { status: "failed", error: "Invalid job" });
    return reply({ error: "Invalid job" }, 422);
  }

  EdgeRuntime.waitUntil(importRun(run.id, job, startedAt));
  return reply({ run_id: run.id, status: "running" }, 202);
});
