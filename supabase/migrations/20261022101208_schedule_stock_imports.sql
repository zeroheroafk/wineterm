-- The stock imports join the silence check of private.check_imports():
-- Italy's monthly reports run weekly, so nine days without a successful
-- run is a fault; France's and Portugal's statements come once a year,
-- in a window of Tuesdays that each job covers, so a year and a few
-- days without success means the whole window failed.
insert into private.import_schedule (source_id, max_silence) values
  ('icqrf-cantina-italia', interval '9 days'),
  ('douane-stocks', interval '370 days'),
  ('ivv-existencias', interval '370 days')
on conflict (source_id) do nothing;
