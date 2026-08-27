# Fixtures

Everything in this directory is **illustrative sample content** used to
demonstrate WineTerm components while the platform has no live data
sources.

Rules:

- Every record carries `status: "illustrative"` or an `ILLUSTRATIVE`
  marker so it can never be mistaken for a real observation.
- Values are plausible orders of magnitude only. They are not real
  prices, volumes, transactions or forecasts and must never be
  presented as live or real-time.
- No real or invented company names, transactions or people appear in
  fixtures. Sources are named generically ("Regional market bulletin").
- The fixture-backed services in `src/services` are the only consumers.
  Replacing a fixture with a real data source means implementing the
  same service interface against an API or database; no component
  changes are required.
