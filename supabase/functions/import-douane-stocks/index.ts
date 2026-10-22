/**
 * Imports France's wine stocks at 31 July from the customs' open data
 * into public.supply_figures: the wine producers and traders declared at
 * the end of each campaign, by category and colour, national totals in
 * hectolitres, for every campaign the customs have published since
 * 2017/2018.
 *
 * The database decides what runs: private.start_douane_stock_imports()
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
  FIRST_CAMPAIGN,
  listPublications,
  SOURCE_ID,
} from "./douane.ts";

const COUNTRY = "FR";
/** Workbooks downloaded at a time, to spare the customs' server. */
const PARALLEL_DOWNLOADS = 2;

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

function key(figure: Pick<Figure, "period" | "product" | "colour" | "holder">): string {
  return `${figure.period} ${figure.product} ${figure.colour} ${figure.holder}`;
}

async function importRun(runId: number, startedAt: string): Promise<void> {
  try {
    const publications = await listPublications();
    if (publications.length === 0) {
      throw new Error(`The customs' listing offers no stock statement since ${FIRST_CAMPAIGN}/${FIRST_CAMPAIGN + 1}`);
    }

    // A campaign's figures are published on the day the listing gives its
    // statement; without that date, when the file was uploaded or this
    // run found it.
    const campaigns = await inBatches(publications, PARALLEL_DOWNLOADS, async (publication) => {
      const { file, uploadedAt } = await fetchWorkbook(publication.fileUrl);
      const listed = publication.publishedOn ? `${publication.publishedOn}T00:00:00Z` : null;
      const published = listed ?? uploadedAt;
      return {
        campaignStart: publication.campaignStart,
        figures: figures(file, publication.campaignStart),
        publishedAt: published && published < startedAt ? published : startedAt,
      };
    });

    const { data: stored, error: readError } = await supabase
      .from("supply_figures")
      .select("period, product, colour, holder, volume_hl, published_at")
      .eq("country", COUNTRY)
      .eq("source_id", SOURCE_ID);
    if (readError) throw new Error(`Reading stored figures failed: ${readError.message}`);
    const known = new Map(stored.map((row) => [key(row as Figure), row]));

    // New figures are added as published; a figure whose volume changed
    // is a revision and keeps its original publication time.
    let revised = 0;
    let count = 0;
    const rows = campaigns.flatMap(({ figures: campaignFigures, publishedAt }) =>
      campaignFigures.flatMap((figure) => {
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
          onConflict: "country,period,measure,product,colour,presentation,holder",
        });
      if (error) throw new Error(`Saving the stock declarations failed: ${error.message}`);
    }

    const notes: string[] = [];
    const found = campaigns.map(({ campaignStart }) => campaignStart);
    const latest = Math.max(...found);
    const missing: string[] = [];
    for (let start = FIRST_CAMPAIGN; start < latest; start++) {
      if (!found.includes(start)) missing.push(`${start}/${start + 1}`);
    }
    if (missing.length > 0) notes.push(`No statement for ${missing.join(", ")}.`);
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
    console.error(`Customs stock run ${runId} failed:`, message);
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
  if (!run) return reply({ error: "No queued customs stock run with this id" }, 404);

  EdgeRuntime.waitUntil(importRun(run.id, startedAt));
  return reply({ run_id: run.id, status: "running" }, 202);
});
