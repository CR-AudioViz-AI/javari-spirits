-- supabase/migrations/20260817d_distillery_trgm.sql
-- /api/search matches name, brand and distillery in one OR. name and brand got
-- trigram indexes; distillery did not. One unindexed branch makes the whole
-- BitmapOr unusable, so every ordered search sequentially scanned 1,563,965
-- rows — 4.8s with an ORDER BY, and only fast without one because LIMIT let it
-- stop early. Index only, no schema or data change.
-- CR AudioViz AI, LLC · EIN 39-3646201 · 2026-08-17
create index if not exists bv_spirits_distillery_trgm_idx
  on public.bv_spirits using gin (distillery gin_trgm_ops);
analyze public.bv_spirits;
