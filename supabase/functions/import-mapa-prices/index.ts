/**
 * Imports the Spanish Ministry of Agriculture's weekly national average
 * wine prices (MAPA, Precios Medios Nacionales) into
 * public.market_observations: white wine without PDO/PGI and red wine
 * without PDO/PGI of 12 points of colour, in EUR/hl, from one workbook per
 * year.
 *
 * The database decides what runs: private.start_mapa_imports() queues one
 * run per year in public.import_runs and posts its id here. This function
 * executes only a queued run, so a stray call can at most start an import
 * that was due anyway. It answers at once and imports in the background,
 * recording the outcome on the run.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.2";

import {
  fetchWorkbook,
  FIRST_YEAR,
  observations,
  SERIES,
  SOURCE_ID,
  workbookUrl,
} from "./pmn.ts";

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

/** Marketing campaign (August to July) containing a date, e.g. "2026/27". */
function campaignOf(date: string): string {
  const year = Number(date.slice(0, 4));
  const start = Number(date.slice(5, 7)) >= 8 ? year : year - 1;
  return `${start}/${String((start + 1) % 100).padStart(2, "0")}`;
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

async function importRun(
  runId: number,
  job: Job,
  startedAt: string,
): Promise<void> {
  try {
    const url = await workbookUrl(job.year);
    if (!url) {
      // In early January the new year's workbook is not out yet.
      if (job.year === new Date().getUTCFullYear()) {
        await finish(runId, {
          status: "succeeded",
          rows_upserted: 0,
          rows_deleted: 0,
          note: `MAPA has not published the ${job.year} workbook yet.`,
        });
        return;
      }
      throw new Error(`The MAPA page lists no ${job.year} workbook`);
    }
    const { file, uploadedAt } = await fetchWorkbook(url);
    const found = observations(file, job.year);
    if (found.length === 0) {
      // A new year's workbook can list its first week before any price.
      await finish(runId, {
        status: "succeeded",
        rows_upserted: 0,
        rows_deleted: 0,
        note: `The ${job.year} workbook has no wine prices yet.`,
      });
      return;
    }
    const dates = found.map((row) => row.observed_on).sort();
    // A new week is published when the workbook that first carries it is
    // uploaded; without that date, when this run found it.
    const publishedAt = uploadedAt && uploadedAt < startedAt ? uploadedAt : startedAt;

    // New weeks are added as published; a week whose value changed is a
    // revision and keeps its original publication time.
    const { data: stored, error: readError } = await supabase
      .from("market_observations")
      .select("series_code, observed_on, value, published_at")
      .in("series_code", SERIES.map((series) => series.code))
      .gte("observed_on", dates[0])
      .lte("observed_on", dates[dates.length - 1]);
    if (readError) throw new Error(`Reading stored prices failed: ${readError.message}`);
    const known = new Map(
      stored.map((row) => [`${row.series_code} ${row.observed_on}`, row]),
    );

    let revised = 0;
    const rows = found.flatMap((row) => {
      const previous = known.get(`${row.series_code} ${row.observed_on}`);
      if (previous && Math.abs(Number(previous.value) - row.value) < 0.005) {
        return [];
      }
      if (previous) revised++;
      return [{
        ...row,
        status: "final",
        published_at: previous?.published_at ?? publishedAt,
        updated_at: startedAt,
        revised: previous !== undefined,
      }];
    });
    if (rows.length > 0) {
      const { error } = await supabase
        .from("market_observations")
        .upsert(rows, { onConflict: "series_code,observed_on" });
      if (error) throw new Error(`Saving ${job.year} failed: ${error.message}`);
    }

    // A series' campaign is that of its latest week. Runs for different
    // years can finish in any order, so the campaign only moves forward.
    for (const { code } of SERIES) {
      const latest = found
        .filter((row) => row.series_code === code)
        .reduce<string | null>(
          (max, row) => (max === null || row.observed_on > max ? row.observed_on : max),
          null,
        );
      if (!latest) continue;
      const campaign = campaignOf(latest);
      const { error } = await supabase
        .from("market_series")
        .update({ campaign })
        .eq("code", code)
        .lt("campaign", campaign);
      if (error) throw new Error(`Updating the ${code} campaign failed: ${error.message}`);
    }

    await finish(runId, {
      status: "succeeded",
      rows_upserted: rows.length,
      rows_deleted: 0,
      note: revised > 0
        ? `${revised} of ${found.length} weekly prices revised since the last import.`
        : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`MAPA run ${runId} failed:`, message);
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

  // Claim the run: only a queued MAPA run moves to running, and once.
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
  if (!run) return reply({ error: "No queued MAPA run with this id" }, 404);

  const job = parseJob(run.job);
  if (!job) {
    await finish(run.id, { status: "failed", error: "Invalid job" });
    return reply({ error: "Invalid job" }, 422);
  }

  EdgeRuntime.waitUntil(importRun(run.id, job, startedAt));
  return reply({ run_id: run.id, status: "running" }, 202);
});
