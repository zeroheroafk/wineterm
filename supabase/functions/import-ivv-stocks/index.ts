/**
 * Imports Portugal's wine and must stocks at 31 July from the wine
 * institute's series workbook into public.supply_figures: the stocks
 * operators declared each year, by category and colour, national totals
 * in hectolitres, for every year the workbook carries.
 *
 * The database decides what runs: private.start_ivv_stock_imports()
 * queues a run in public.import_runs and posts its id here. This function
 * executes only a queued run, so a stray call can at most start an import
 * that was due anyway. It answers at once and imports in the background,
 * recording the outcome on the run.
 */

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.117.2";

import {
  fetchWorkbook,
  type Figure,
  figures,
  seriesPageUrl,
  seriesWorkbook,
  SOURCE_ID,
} from "./ivv.ts";

const COUNTRY = "PT";

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

function key(figure: Pick<Figure, "period" | "product" | "colour">): string {
  return `${figure.period} ${figure.product} ${figure.colour}`;
}

async function importRun(runId: number, startedAt: string): Promise<void> {
  try {
    const pageUrl = await seriesPageUrl();
    if (!pageUrl) throw new Error("The IVV's documents list no stock series");
    const workbook = await seriesWorkbook(pageUrl);
    if (!workbook) throw new Error(`${pageUrl} links no workbook`);
    const { file, uploadedAt } = await fetchWorkbook(workbook.url);
    const { figures: found, years } = figures(file);

    // The series is published when its workbook is uploaded; the page's
    // own date is the day the page was made, which an updated workbook
    // outlives, so it serves only without the upload time.
    const listed = workbook.publishedOn ? `${workbook.publishedOn}T00:00:00Z` : null;
    const published = uploadedAt ?? listed;
    const publishedAt = published && published < startedAt ? published : startedAt;

    const { data: stored, error: readError } = await supabase
      .from("supply_figures")
      .select("period, product, colour, volume_hl, published_at")
      .eq("country", COUNTRY)
      .eq("source_id", SOURCE_ID);
    if (readError) throw new Error(`Reading stored figures failed: ${readError.message}`);
    const known = new Map(stored.map((row) => [key(row as Figure), row]));

    // New figures are added as published; a figure whose volume changed
    // is a revision and keeps its original publication time.
    let revised = 0;
    const rows = found.flatMap((figure) => {
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
      if (error) throw new Error(`Saving the stock series failed: ${error.message}`);
    }

    const notes = [`Years ${years[0]} to ${years[years.length - 1]} from ${workbook.url}.`];
    if (revised > 0) {
      notes.push(`${revised} of ${found.length} figures revised since the last import.`);
    }
    await finish(runId, {
      status: "succeeded",
      rows_upserted: rows.length,
      rows_deleted: 0,
      note: notes.join(" "),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`IVV stock run ${runId} failed:`, message);
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
  if (!run) return reply({ error: "No queued IVV stock run with this id" }, 404);

  EdgeRuntime.waitUntil(importRun(run.id, startedAt));
  return reply({ run_id: run.id, status: "running" }, 202);
});
