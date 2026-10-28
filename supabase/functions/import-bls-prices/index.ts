/**
 * Imports the US Bureau of Labor Statistics' monthly average price of a
 * litre of table wine in US cities into public.consumer_prices, in USD
 * per litre, for the years a run names.
 *
 * The database decides what runs: private.start_bls_price_imports()
 * queues a run in public.import_runs and posts its id here. This function
 * executes only a queued run, so a stray call can at most start an import
 * that was due anyway. It answers at once and imports in the background,
 * recording the outcome on the run.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.2";

import { fetchPrices, SOURCE_ID } from "./bls.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

const COUNTRY = "US";
const PRODUCT = "table-wine";
const MEASURE = "average-price";
/** The first year of the series WineTerm reads. */
const FIRST_YEAR = 2000;

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
  startedAt: string,
  fromYear: number,
  toYear: number,
): Promise<void> {
  try {
    const prices = await fetchPrices(fromYear, toYear);
    if (prices.length === 0) {
      throw new Error(`The BLS published no price from ${fromYear} to ${toYear}`);
    }

    // The BLS gives no publication date, so a new month is published when
    // this run found it; a month whose price changed is a revision and
    // keeps its original publication time.
    const { data: stored, error: readError } = await supabase
      .from("consumer_prices")
      .select("period, value, status, published_at, revised")
      .eq("country", COUNTRY)
      .eq("product", PRODUCT)
      .eq("measure", MEASURE)
      .gte("period", prices[0].period)
      .lte("period", prices[prices.length - 1].period);
    if (readError) throw new Error(`Reading stored prices failed: ${readError.message}`);
    const known = new Map(stored.map((row) => [row.period, row]));

    let revised = 0;
    const rows = prices.flatMap((price) => {
      const previous = known.get(price.period);
      const changed = !previous || Math.abs(Number(previous.value) - price.value) >= 0.0005;
      if (previous && !changed && previous.status === price.status) return [];
      if (previous && changed) revised++;
      return [{
        country: COUNTRY,
        product: PRODUCT,
        measure: MEASURE,
        period: price.period,
        value: price.value,
        unit: "USD/litre",
        annual_rate: null,
        status: price.status,
        source_id: SOURCE_ID,
        published_at: previous?.published_at ?? startedAt,
        updated_at: startedAt,
        revised: previous ? previous.revised || changed : false,
      }];
    });
    if (rows.length > 0) {
      const { error } = await supabase
        .from("consumer_prices")
        .upsert(rows, { onConflict: "country,product,measure,period" });
      if (error) throw new Error(`Saving prices failed: ${error.message}`);
    }

    await finish(runId, {
      status: "succeeded",
      rows_upserted: rows.length,
      rows_deleted: 0,
      note: revised > 0
        ? `${revised} of ${prices.length} monthly prices revised since the last import.`
        : null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`BLS price run ${runId} failed:`, message);
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
  if (!run) return reply({ error: "No queued BLS price run with this id" }, 404);

  const { from_year: fromYear, to_year: toYear } = run.job as {
    from_year?: unknown;
    to_year?: unknown;
  };
  const thisYear = new Date().getUTCFullYear();
  if (
    typeof fromYear !== "number" || typeof toYear !== "number" ||
    !Number.isInteger(fromYear) || !Number.isInteger(toYear) ||
    fromYear < FIRST_YEAR || fromYear > toYear || toYear > thisYear
  ) {
    await finish(run.id, {
      status: "failed",
      error: `The run's years must run from ${FIRST_YEAR} to ${thisYear}, oldest first`,
    });
    return reply({ error: "The run's years are not valid" }, 400);
  }

  EdgeRuntime.waitUntil(importRun(run.id, startedAt, fromYear, toYear));
  return reply({ run_id: run.id, status: "running" }, 202);
});
