-- Two indexes the database advisor reports as never used: the site reads
-- market_series and supply_figures whole, so neither column is a filter.
--
-- Not yet applied: the Supabase MCP server waits for a confirmation of
-- drops that does not reach the user. Apply it with the Supabase CLI or
-- the SQL editor; until then the indexes only cost a little write time.
drop index if exists public.supply_figures_source_id_idx;
