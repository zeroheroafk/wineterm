/**
 * Imports monthly EU trade in wine (CN heading 2204) from Eurostat Comext,
 * dataset DS-045409, into public.trade_flows.
 *
 * The database decides what runs: private.start_comext_imports() queues a
 * run in public.import_runs and posts its id here. This function executes
 * only a queued run, so a stray call can at most start an import that was
 * due anyway. It answers at once and imports in the background, recording
 * the outcome on the run.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.2";

const DATASET =
  "https://ec.europa.eu/eurostat/api/comext/dissemination/statistics/1.0/data/DS-045409";
const SOURCE_ID = "eurostat-comext";

/**
 * Heading 2204 and its subheadings: sparkling wine; still wine in
 * containers up to 2 l, 2 to 10 l and over 10 l (bulk); other grape must.
 */
const PRODUCTS = ["2204", "220410", "220421", "220422", "220429", "220430"];
const REPORTERS = ["ES", "PT", "FR", "IT"];
const FLOW_CODES = { import: "1", export: "2" } as const;
/** Partner aggregates kept alongside the individual countries. */
const AGGREGATES = new Set(["WORLD", "EXT_EU27_2020", "INT_EU27_2020"]);
/** First year of monthly CN8 data in the dataset. */
const FIRST_YEAR = 2002;
const BATCH_SIZE = 1000;

type Flow = keyof typeof FLOW_CODES;

interface Job {
  reporter: string;
  flow: Flow;
  from_year: number;
  to_year: number;
}

interface TradeRow {
  reporter: string;
  partner: string;
  product: string;
  flow: Flow;
  period: string;
  value_eur: number | null;
  quantity_kg: number | null;
  source_id: string;
  imported_at: string;
}

/** The parts of a JSON-stat 2.0 dataset this import reads. */
interface JsonStatDataset {
  id: string[];
  size: number[];
  dimension: Record<
    string,
    { category: { index: Record<string, number> | string[] } }
  >;
  value: Record<string, number | null> | (number | null)[];
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
  const { reporter, flow, from_year, to_year } = value as Record<
    string,
    unknown
  >;
  if (typeof reporter !== "string" || !REPORTERS.includes(reporter)) {
    return null;
  }
  if (flow !== "import" && flow !== "export") return null;
  if (typeof from_year !== "number" || typeof to_year !== "number") {
    return null;
  }
  if (
    !Number.isInteger(from_year) ||
    !Number.isInteger(to_year) ||
    from_year < FIRST_YEAR ||
    from_year > to_year ||
    to_year > new Date().getUTCFullYear()
  ) {
    return null;
  }
  return { reporter, flow, from_year, to_year };
}

async function fetchYear(job: Job, year: number): Promise<JsonStatDataset> {
  const query = new URLSearchParams({
    format: "JSON",
    lang: "EN",
    freq: "M",
    reporter: job.reporter,
    flow: FLOW_CODES[job.flow],
    // Months not yet published come back empty, a future year as an
    // empty dataset, so a whole calendar year is always safe to ask for.
    sinceTimePeriod: `${year}-01`,
    untilTimePeriod: `${year}-12`,
  });
  for (const product of PRODUCTS) query.append("product", product);
  query.append("indicators", "VALUE_IN_EUROS");
  query.append("indicators", "QUANTITY_IN_100KG");

  const response = await fetch(`${DATASET}?${query}`, {
    headers: { Accept: "application/json" },
    signal: AbortSignal.timeout(60_000),
  });
  if (!response.ok) {
    const detail = (await response.text()).slice(0, 300);
    throw new Error(`Comext answered ${response.status} for ${year}: ${detail}`);
  }
  return await response.json();
}

/** Category codes of one dimension, in position order. */
function codesOf(data: JsonStatDataset, dimension: string): string[] {
  const index = data.dimension[dimension]?.category.index;
  if (!index) throw new Error(`Comext response has no ${dimension} dimension`);
  if (Array.isArray(index)) return index;
  const codes: string[] = [];
  for (const [code, position] of Object.entries(index)) codes[position] = code;
  return codes;
}

/** One row per partner, product and month, from a JSON-stat dataset. */
function toRows(
  data: JsonStatDataset,
  job: Job,
  importedAt: string,
): TradeRow[] {
  const codes = data.id.map((dimension) => codesOf(data, dimension));
  const axisOf = (dimension: string) => {
    const axis = data.id.indexOf(dimension);
    if (axis === -1) throw new Error(`Comext response has no ${dimension} axis`);
    return axis;
  };
  const reporterAxis = axisOf("reporter");
  const flowAxis = axisOf("flow");
  const partnerAxis = axisOf("partner");
  const productAxis = axisOf("product");
  const indicatorAxis = axisOf("indicators");
  const timeAxis = axisOf("time");
  if (
    codes[reporterAxis].join() !== job.reporter ||
    codes[flowAxis].join() !== FLOW_CODES[job.flow]
  ) {
    throw new Error("Comext returned another reporter or flow than requested");
  }

  const rows = new Map<string, TradeRow>();
  for (const [key, value] of Object.entries(data.value)) {
    if (typeof value !== "number") continue;

    // A flat index is row-major over the dimensions, in data.id order.
    let rest = Number(key);
    const position = new Array<number>(data.size.length);
    for (let axis = data.size.length - 1; axis >= 0; axis--) {
      position[axis] = rest % data.size[axis];
      rest = Math.floor(rest / data.size[axis]);
    }

    const indicator = codes[indicatorAxis][position[indicatorAxis]];
    if (indicator !== "VALUE_IN_EUROS" && indicator !== "QUANTITY_IN_100KG") {
      continue;
    }
    const partner = codes[partnerAxis][position[partnerAxis]];
    if (!/^[A-Z]{2}$/.test(partner) && !AGGREGATES.has(partner)) continue;
    const product = codes[productAxis][position[productAxis]];
    const month = codes[timeAxis][position[timeAxis]];
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new Error(`Unexpected Comext period ${month}`);
    }
    const period = `${month}-01`;

    const id = `${partner} ${product} ${period}`;
    let row = rows.get(id);
    if (!row) {
      row = {
        reporter: job.reporter,
        partner,
        product,
        flow: job.flow,
        period,
        value_eur: null,
        quantity_kg: null,
        source_id: SOURCE_ID,
        imported_at: importedAt,
      };
      rows.set(id, row);
    }
    if (indicator === "VALUE_IN_EUROS") row.value_eur = value;
    else row.quantity_kg = Math.round(value * 10_000) / 100;
  }
  return [...rows.values()];
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
    for (let year = job.from_year; year <= job.to_year; year++) {
      const rows = toRows(await fetchYear(job, year), job, startedAt);
      for (let start = 0; start < rows.length; start += BATCH_SIZE) {
        const { error } = await supabase
          .from("trade_flows")
          .upsert(rows.slice(start, start + BATCH_SIZE), {
            onConflict: "reporter,partner,product,flow,period",
          });
        if (error) throw new Error(`Saving ${year} failed: ${error.message}`);
      }
      upserted += rows.length;

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
          throw new Error(`Cleaning up ${year} failed: ${error.message}`);
        }
        deleted += count ?? 0;
      }
    }
    await finish(runId, {
      status: "succeeded",
      rows_upserted: upserted,
      rows_deleted: deleted,
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
