/**
 * Imports the Spanish Ministry of Agriculture's weekly bulk wine prices in
 * its representative markets (MAPA, Informe Semanal de Coyuntura, table
 * 2.2) into public.market_observations: white and red wine without
 * PDO/PGI, ex-winery, in EUR/hl, from one workbook per week.
 *
 * The database decides what runs: private.start_mapa_market_imports()
 * queues one run per year in public.import_runs, and the pg_cron job
 * dispatch-mapa-market-imports posts each queued run's id here. This
 * function executes only a queued run, so a stray call can at most start
 * an import that was due anyway. It answers at once and imports in the
 * background, recording the outcome on the run.
 *
 * Edge Functions get about two seconds of CPU time per call, less than
 * reading a year's workbooks takes. Each workbook read is kept in
 * public.mapa_market_reports, so a call reads at most BATCH new ones and,
 * while some remain, queues its run again for the dispatcher to post. The
 * call that finds none left settles the year's weeks from the kept
 * reports and saves the prices.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.2";

import {
  beforeTable,
  fetchWorkbook,
  FIRST_YEAR,
  labelWeek,
  type Observation,
  SERIES_CODES,
  settleWeeks,
  SOURCE_ID,
  weekPrices,
  type WeekPrices,
  yearWorkbooks,
} from "./isc.ts";

interface Job {
  year: number;
}

/** Workbooks read per call, well within its CPU time. */
const BATCH = 8;
/** Workbooks downloaded at once. */
const CONCURRENCY = 4;

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

/** A row of public.mapa_market_reports. */
interface StoredReport {
  url: string;
  /** Null for a workbook without table 2.2, or one that could not be read. */
  week: string | null;
  link_week: string | null;
  observations: Observation[];
  unknown_markets: string[];
  uploaded_at: string | null;
  /** Why the workbook could not be read; it is read again by the next run. */
  error: string | null;
}

/**
 * Reads up to BATCH of the year's workbooks not yet kept, or kept with an
 * error before this run was queued, and keeps them. Returns how many
 * remain to read.
 */
async function readBatch(year: number, queuedAt: string): Promise<number> {
  const links = await yearWorkbooks(year);
  const { data: kept, error } = await supabase
    .from("mapa_market_reports")
    .select("url, error, read_at")
    .eq("year", year);
  if (error) throw new Error(`Reading kept reports failed: ${error.message}`);
  const done = new Set(
    kept.filter((row) => !row.error || row.read_at >= queuedAt).map((row) => row.url),
  );
  const unread = links.filter((link) => !done.has(link.url));
  const batch = unread.slice(0, BATCH);

  const rows: (StoredReport & { year: number; label: string; read_at: string })[] = [];
  const readAt = new Date().toISOString();
  let next = 0;
  async function worker(): Promise<void> {
    while (next < batch.length) {
      const link = batch[next++];
      const week = labelWeek(link.label);
      try {
        // A workbook from before table 2.2 began is kept without its
        // prices, so it is not read again.
        let report: WeekPrices | null = null;
        let uploadedAt: string | null = null;
        if (!beforeTable(year, week)) {
          const workbook = await fetchWorkbook(link.url);
          report = weekPrices(workbook.file, year, week);
          uploadedAt = workbook.uploadedAt;
        }
        rows.push({
          url: link.url,
          year,
          label: link.label,
          week: report?.week ?? null,
          link_week: report?.linkWeek ?? null,
          observations: report?.observations ?? [],
          unknown_markets: report?.unknownMarkets ?? [],
          uploaded_at: uploadedAt,
          error: null,
          read_at: readAt,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        rows.push({
          url: link.url,
          year,
          label: link.label,
          week: null,
          link_week: null,
          observations: [],
          unknown_markets: [],
          uploaded_at: null,
          error: message.slice(0, 500),
          read_at: readAt,
        });
      }
    }
  }
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
  if (rows.length > 0) {
    const { error: saveError } = await supabase.from("mapa_market_reports").upsert(rows);
    if (saveError) throw new Error(`Keeping reports failed: ${saveError.message}`);
  }
  return unread.length - batch.length;
}

/**
 * The year's kept reports with table 2.2, as weekPrices returned them,
 * with the count of those without it and the workbooks not read.
 */
async function keptReports(year: number): Promise<{
  reports: WeekPrices[];
  withoutTable: number;
  failures: string[];
}> {
  const { data, error } = await supabase
    .from("mapa_market_reports")
    .select("url, label, week, link_week, observations, unknown_markets, uploaded_at, error")
    .eq("year", year);
  if (error) throw new Error(`Reading kept reports failed: ${error.message}`);
  const rows = data as (StoredReport & { label: string })[];
  return {
    reports: rows.flatMap((row) =>
      row.week
        ? [{
          week: row.week,
          linkWeek: row.link_week,
          observations: row.observations,
          unknownMarkets: row.unknown_markets,
          uploadedAt: row.uploaded_at,
        }]
        : []
    ),
    withoutTable: rows.filter((row) => !row.week && !row.error).length,
    failures: rows.flatMap((row) => (row.error ? [`${row.label}: ${row.error}`] : [])),
  };
}

async function importRun(
  runId: number,
  job: Job,
  startedAt: string,
  queuedAt: string,
): Promise<void> {
  try {
    const remaining = await readBatch(job.year, queuedAt);
    if (remaining > 0) {
      // Queue the run again; the dispatcher posts it for the next batch.
      const { error } = await supabase
        .from("import_runs")
        .update({
          status: "queued",
          dispatched_at: null,
          note: `${remaining} workbooks of ${job.year} left to read.`,
        })
        .eq("id", runId)
        .eq("status", "running");
      if (error) throw new Error(`Queueing the next batch failed: ${error.message}`);
      return;
    }

    const { reports, withoutTable, failures } = await keptReports(job.year);
    const { observations: found, uploads, notes } = settleWeeks(reports);
    const unknown = [...new Set(reports.flatMap((report) => report.unknownMarkets))];

    let saved = 0;
    let revised = 0;
    if (found.length > 0) {
      const dates = found.map((row) => row.observed_on).sort();
      const { data: stored, error: readError } = await supabase
        .from("market_observations")
        .select("series_code, observed_on, value, published_at")
        .in("series_code", SERIES_CODES)
        .gte("observed_on", dates[0])
        .lte("observed_on", dates[dates.length - 1]);
      if (readError) throw new Error(`Reading stored prices failed: ${readError.message}`);
      const known = new Map(
        stored.map((row) => [`${row.series_code} ${row.observed_on}`, row]),
      );

      // New weeks are published when the ministry uploaded their workbook;
      // a week whose value changed is a revision and keeps its original
      // publication time.
      const rows = found.flatMap((observation) => {
        // The database keeps four decimals; the workbooks carry more.
        const row = {
          ...observation,
          value: Math.round(observation.value * 10_000) / 10_000,
        };
        const previous = known.get(`${row.series_code} ${row.observed_on}`);
        if (previous && Math.abs(Number(previous.value) - row.value) < 0.00001) {
          return [];
        }
        if (previous) revised++;
        const uploadedAt = uploads.get(row.observed_on) ?? null;
        return [{
          ...row,
          status: "final",
          published_at: previous?.published_at ??
            (uploadedAt && uploadedAt < startedAt ? uploadedAt : startedAt),
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
      saved = rows.length;

      // A series' campaign is that of its latest week. Runs for different
      // years can finish in any order, so the campaign only moves forward.
      for (const code of SERIES_CODES) {
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
    }

    const remarks = [
      ...notes,
      revised > 0 ? `${revised} of ${found.length} prices revised since the last import.` : null,
      withoutTable > 0 ? `${withoutTable} workbooks without table 2.2.` : null,
      unknown.length > 0 ? `Markets not imported: ${unknown.join(", ")}.` : null,
    ].filter(Boolean).join(" ");

    if (failures.length > 0) {
      // The other weeks are saved; the run fails so the change is seen.
      await finish(runId, {
        status: "failed",
        rows_upserted: saved,
        error: failures.join(" | ").slice(0, 1000),
        note: remarks.slice(0, 1000) || null,
      });
      return;
    }
    await finish(runId, {
      status: "succeeded",
      rows_upserted: saved,
      rows_deleted: 0,
      note: remarks.slice(0, 1000) ||
        (found.length === 0 ? `No ${job.year} wine market prices published yet.` : null),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`MAPA markets run ${runId} failed:`, message);
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
    .select("id, job, queued_at")
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
  if (!run) return reply({ error: "No queued MAPA markets run with this id" }, 404);

  const job = parseJob(run.job);
  if (!job) {
    await finish(run.id, { status: "failed", error: "Invalid job" });
    return reply({ error: "Invalid job" }, 422);
  }

  EdgeRuntime.waitUntil(importRun(run.id, job, startedAt, run.queued_at));
  return reply({ run_id: run.id, status: "running" }, 202);
});
