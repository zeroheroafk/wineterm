-- Outbound HTTP from the database, used to invoke Edge Functions that
-- fetch the external data sources (and, later, to schedule imports with
-- pg_cron). The net schema is not exposed through the Data API.
create extension if not exists pg_net with schema extensions;
