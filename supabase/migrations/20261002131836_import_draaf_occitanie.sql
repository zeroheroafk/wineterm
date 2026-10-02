-- Monthly French bulk wine prices by basin from the regional office of the
-- Ministry of Agriculture in Occitanie (DRAAF Occitanie, Marché vrac des
-- vins de la région Occitanie): the source, twelve series and the import
-- that loads them into public.market_observations.
--
-- The office keeps one page up to date with the monthly average prices of
-- the bulk purchase contracts presented for visa to FranceAgriMer and the
-- interprofessions, for wine without GI and PGI wine produced in the
-- departments of former Languedoc-Roussillon and of former Midi-Pyrénées,
-- by colour, over the last three campaigns. The import-draaf-occitanie
-- function reads it; start_draaf_imports() queues a run and posts it.
-- pg_cron calls it every week; call it by hand to import at once:
-- select private.start_draaf_imports();
--
-- It reads the project URL and the anon key from Vault, secrets
-- project_url and anon_key, which are set per project and never
-- committed. Without them it only raises a warning.

insert into public.sources (id, name, kind, classification, coverage, cadence, note, url)
values (
  'draaf-occitanie',
  'DRAAF Occitanie, Marché vrac des vins',
  'official-bulletin',
  'official',
  'France, Occitanie: monthly prices of bulk wine without GI and PGI wine by colour, in the departments of former Languedoc-Roussillon and of former Midi-Pyrénées',
  'Monthly, some weeks after the month ends',
  'Official statistics of the regional office of the French Ministry of Agriculture, from the bulk wine purchase contracts presented for visa to FranceAgriMer and the interprofessions, imported unchanged: average prices in euros per hectolitre. Source: DRAAF Occitanie, from FranceAgriMer data, reused under the Licence Ouverte / Etalab 2.0.',
  'https://draaf.occitanie.agriculture.gouv.fr/marche-vrac-des-vins-de-la-region-occitanie-donnees-actualisees-a345.html'
);

insert into public.market_series (
  code, kind, name, country, region, appellation, colour, classification,
  category, spec, product, unit, campaign, source_id, source_type,
  verification, methodology
)
select format('FR-%s-%s-%s', basin.code, colour.code, category.code),
       'bulk-wine',
       format(category.name, basin.name, colour.word),
       'FR',
       'Occitanie',
       basin.name,
       colour.colour,
       category.classification,
       null,
       null,
       format(category.product, colour.word, initcap(colour.word)),
       'EUR/hl',
       '2025/26',
       'draaf-occitanie',
       'official',
       'verified',
       format(
         'Monthly average price of %s produced in the departments of former %s (%s), from the purchase contracts presented for visa to FranceAgriMer and the interprofessions, in EUR/hl, as DRAAF Occitanie, the regional office of the French Ministry of Agriculture, publishes it on its page on the Occitanie bulk wine market, imported unchanged. Each price is dated to the last day of its month; months without a published price are left empty. The page covers the last three campaigns, and earlier months stay as imported. Published is the date the page carried when the month first appeared on it.',
         format(category.phrase, colour.word),
         basin.name,
         basin.departments
       )
  from (
    values
      ('LR', 'Languedoc-Roussillon',
       'Aude, Gard, Hérault, Lozère and Pyrénées-Orientales'),
      ('MP', 'Midi-Pyrénées',
       'Ariège, Aveyron, Haute-Garonne, Gers, Lot, Hautes-Pyrénées, Tarn and Tarn-et-Garonne')
  ) as basin (code, name, departments)
  cross join (
    values ('RED', 'red', 'red'), ('ROS', 'rose', 'rosé'), ('WHT', 'white', 'white')
  ) as colour (code, colour, word)
  cross join (
    -- product takes the colour word twice, as written and capitalised.
    values
      ('NGI', 'no-gi', '%s %s without GI', '%2$s wine without GI, all grape varieties',
       'bulk %s wine without GI'),
      ('PGI', 'pgi', '%s PGI %s', 'PGI %1$s wine, all PGIs and grape varieties',
       'bulk PGI %s wine')
  ) as category (code, classification, name, product, phrase);

-- Queues one run and posts it to the import-draaf-occitanie function.
create function private.start_draaf_imports()
returns bigint
language plpgsql
set search_path = ''
as $$
declare
  project_url text;
  anon_key text;
  run_id bigint;
begin
  select decrypted_secret into project_url
    from vault.decrypted_secrets where name = 'project_url';
  select decrypted_secret into anon_key
    from vault.decrypted_secrets where name = 'anon_key';
  if project_url is null or anon_key is null then
    raise warning 'DRAAF Occitanie import not started: set the Vault secrets project_url and anon_key';
    return null;
  end if;

  -- Close runs left behind: a function stopped at its time limit never
  -- records an outcome, and a post that never arrived leaves its run
  -- queued.
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Did not finish'
   where source_id = 'draaf-occitanie'
     and status = 'running'
     and started_at < now() - interval '15 minutes';
  update public.import_runs
     set status = 'failed', finished_at = now(), error = 'Never started'
   where source_id = 'draaf-occitanie'
     and status = 'queued'
     and queued_at < now() - interval '15 minutes';

  insert into public.import_runs (source_id, scope, job, dispatched_at)
  values ('draaf-occitanie', 'Occitanie monthly prices', '{}'::jsonb, now())
  returning id into run_id;

  perform net.http_post(
    url := project_url || '/functions/v1/import-draaf-occitanie',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || anon_key
    ),
    body := jsonb_build_object('run_id', run_id),
    timeout_milliseconds := 30000
  );
  return run_id;
end;
$$;

revoke all on function private.start_draaf_imports()
  from public, anon, authenticated;

-- The page gains a month some weeks after it ends, on no fixed day, and
-- its weekly summaries change every week. Checking on Wednesday mornings
-- publishes a new month within a week.
select cron.schedule(
  'import-draaf-occitanie',
  '43 6 * * 3',
  $$select private.start_draaf_imports()$$
);
