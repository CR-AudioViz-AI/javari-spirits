-- supabase/migrations/20260817b_spirits_search_indexes.sql
-- Indexes for the 1.5M-row bv_spirits table so listing and search stop hitting
-- the statement timeout. Additive: indexes only, no schema or data change.
-- CR AudioViz AI, LLC · EIN 39-3646201 · 2026-08-17

-- /api/spirits filters out Open Food Facts imports then orders by msrp. The
-- predicate uses a leading-wildcard ilike, which no ordinary index can serve, so
-- every request sequentially scanned 1,563,965 rows. A partial index carrying
-- the same constant predicate can serve it, and carries the sort order with it.
create index if not exists bv_spirits_real_msrp_idx
  on public.bv_spirits (msrp desc nulls last)
  where description not ilike '%Imported from Open Food Facts. Barcode:%';

-- Name and brand carry the fuzzy search. Trigram indexes make a leading-wildcard
-- ilike indexable, which is the whole basis of the search route.
create extension if not exists pg_trgm;
create index if not exists bv_spirits_name_trgm_idx  on public.bv_spirits using gin (name gin_trgm_ops);
create index if not exists bv_spirits_brand_trgm_idx on public.bv_spirits using gin (brand gin_trgm_ops);

analyze public.bv_spirits;
