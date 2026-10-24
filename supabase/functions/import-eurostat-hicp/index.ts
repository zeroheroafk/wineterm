/**
 * Imports Eurostat's harmonised index of consumer prices of wine from
 * grapes (ECOICOP ver. 2, 02.1.2.1) into public.consumer_prices: the
 * monthly index, 2025 = 100, and its annual rate of change, for the EU,
 * its 27 countries and Switzerland, every month the dataset holds.
 *
 * The database decides what runs: private.start_eurostat_hicp_imports()
 * queues a run in public.import_runs and posts its id here. This function
 * executes only a queued run, so a stray call can at most start an import
 * that was due anyway. It answers at once and imports in the background,
 * recording the outcome on the run.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.2";

import { fetchRelease, SOURCE_ID } from "./hicp.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

/** The Data API returns at most this many rows per request. */
const PAGE_SIZE = 1000;
const PRODUCT = "wine-from-grapes";
const MEASURE = "index";

function reply(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
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

interface Stored {
  country: string;
  period: string;
  value: number;
  annual_rate: number | null;
  status: string;
  published_at: string;
  revised: boolean;
}

/** Every figure already stored from this source. */
async function storedFigures(): Promise<Stored[]> {
  const rows: Stored[] = [];
  for (;;) {
    const page = await supabase
      .from("consumer_prices")
      .select("country, period, value, annual_rate, status, published_at, revised")
      .eq("source_id", SOURCE_ID)
      .eq("product", PRODUCT)
      .eq("measure", MEASURE)
      .order("country")
      .order("period")
      .range(rows.length, rows.length + PAGE_SIZE - 1);
    if (page.error) throw new Error(`Reading stored figures failed: ${page.error.message}`);
    rows.push(...page.data);
    if (page.data.length < PAGE_SIZE) return rows;
  }
}

/** Whether two published figures differ, at the precision they carry. */
function differs(a: number | null, b: number | null, precision: number): boolean {
  if (a === null || b === null) return a !== b;
  return Math.abs(Number(a) - Number(b)) >= precision / 2;
}

async function importRun(runId: number, startedAt: string): Promise<void> {
  try {
    const { figures, updatedAt } = await fetchRelease();
    // A new month is published when the dataset that first carries it
    // was updated; without that date, when this run found it.
    const publishedAt = updatedAt && updatedAt < startedAt ? updatedAt : startedAt;

    // New months are added as published; a month whose index or rate
    // changed is a revision and keeps its original publication time.
    const known = new Map(
      (await storedFigures()).map((row) => [`${row.country} ${row.period}`, row]),
    );
    let revised = 0;
    const rows = figures.flatMap((figure) => {
      const previous = known.get(`${figure.country} ${figure.period}`);
      const changed =
        !previous ||
        differs(previous.value, figure.value, 0.01) ||
        differs(previous.annual_rate, figure.annual_rate, 0.1);
      if (previous && !changed && previous.status === figure.status) return [];
      if (previous && changed) revised++;
      return [{
        ...figure,
        product: PRODUCT,
        measure: MEASURE,
        unit: "2025=100",
        source_id: SOURCE_ID,
        published_at: previous?.published_at ?? publishedAt,
        updated_at: startedAt,
        revised: previous ? previous.revised || changed : false,
      }];
    });
    for (let start = 0; start < rows.length; start += PAGE_SIZE) {
      const { error } = await supabase
        .from("consumer_prices")
        .upsert(rows.slice(start, start + PAGE_SIZE), {
          onConflict: "country,product,measure,period",
        });
      if (error) throw new Error(`Saving figures failed: ${error.message}`);
    }

    await finish(runId, {
      status: "succeeded",
      rows_upserted: rows.length,
      rows_deleted: 0,
      note: revised > 0
        ? `${revised} of ${figures.length} monthly figures revised since the last import.`
        : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Eurostat HICP run ${runId} failed:`, message);
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
    .select("id")
    .maybeSingle();
  if (error?.code === "23505") {
    // import_runs_one_running_idx: an import is already in progress.
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
  if (!run) return reply({ error: "No queued Eurostat HICP run with this id" }, 404);

  EdgeRuntime.waitUntil(importRun(run.id, startedAt));
  return reply({ run_id: run.id, status: "running" }, 202);
});
