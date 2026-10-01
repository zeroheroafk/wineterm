/**
 * Imports monthly EU trade in wine (CN heading 2204) from Eurostat Comext,
 * dataset DS-045409, into public.trade_flows: value and net mass of the
 * heading and its subheadings, and their volume in litres, which Comext
 * publishes only for the CN8 codes below them.
 *
 * The database decides what runs: private.start_comext_imports() queues one
 * run per reporter, flow and year in public.import_runs, and
 * private.dispatch_comext_imports() posts their ids here one at a time.
 * This function executes only a queued run, so a stray call can at most
 * start an import that was due anyway. It answers at once and imports in
 * the background, recording the outcome on the run.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.2";

import {
  fetchYear,
  type Job,
  parseJob,
  PRODUCTS,
  SOURCE_ID,
  tradeRows,
} from "./comext.ts";

const BATCH_SIZE = 1000;

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
  let upserted = 0;
  let deleted = 0;
  try {
    const rows = tradeRows(job, await fetchYear(job), startedAt);
    for (let start = 0; start < rows.length; start += BATCH_SIZE) {
      const { error } = await supabase
        .from("trade_flows")
        .upsert(rows.slice(start, start + BATCH_SIZE), {
          onConflict: "reporter,partner,product,flow,period",
        });
      if (error) throw new Error(`Saving ${job.year} failed: ${error.message}`);
    }
    upserted = rows.length;

    // In the months just received, rows this run did not refresh are no
    // longer published (for example, revised to nothing): drop them.
    const periods = [...new Set(rows.map((row) => row.period))];
    if (periods.length > 0) {
      const { count, error } = await supabase
        .from("trade_flows")
        .delete({ count: "exact" })
        .eq("source_id", SOURCE_ID)
        .eq("reporter", job.reporter)
        .eq("flow", job.flow)
        .in("product", PRODUCTS)
        .in("period", periods)
        .lt("imported_at", startedAt);
      if (error) {
        throw new Error(`Cleaning up ${job.year} failed: ${error.message}`);
      }
      deleted = count ?? 0;
    }

    const withoutLitres = rows.filter((row) => row.quantity_l === null).length;
    await finish(runId, {
      status: "succeeded",
      rows_upserted: upserted,
      rows_deleted: deleted,
      note: withoutLitres > 0
        ? `${withoutLitres} of ${rows.length} rows saved without litres: their CN8 codes do not add up to their value.`
        : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Comext run ${runId} failed:`, message);
    await finish(runId, {
      status: "failed",
      rows_upserted: upserted,
      rows_deleted: deleted,
      error: message.slice(0, 1000),
    });
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

  // Claim the run: only a queued Comext run moves to running, and once.
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
    // import_runs_one_running_idx: this scope is already being imported.
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
  if (!run) return reply({ error: "No queued Comext run with this id" }, 404);

  const job = parseJob(run.job);
  if (!job) {
    await finish(run.id, { status: "failed", error: "Invalid job" });
    return reply({ error: "Invalid job" }, 422);
  }

  EdgeRuntime.waitUntil(importRun(run.id, job, startedAt));
  return reply({ run_id: run.id, status: "running" }, 202);
});
