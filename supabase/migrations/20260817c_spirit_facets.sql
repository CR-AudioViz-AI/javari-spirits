-- supabase/migrations/20260817c_spirit_facets.sql
-- Precomputed search facets for bv_spirits.
--
-- /api/search built its facet sidebar by pulling the category column for all
-- 1,563,965 rows, then the country column for all 1,563,965 rows, and counting
-- both in JavaScript. That is 8 of the 8.6 seconds a search took. Grouping in
-- the database is 3-4s per dimension, still far past budget, so the answer is
-- precomputed and refreshed rather than computed per request.
--
-- The facets do not vary by search term — getFacets accepts the current filters
-- and never reads them — so a single global snapshot is exactly correct, not an
-- approximation.
--
-- CR AudioViz AI, LLC · EIN 39-3646201 · 2026-08-17

drop materialized view if exists public.bv_spirit_facets;

create materialized view public.bv_spirit_facets as
with bands as (
  select
    count(*) filter (where msrp >= 0   and msrp <  25)     as p0,
    count(*) filter (where msrp >= 25  and msrp <  50)     as p1,
    count(*) filter (where msrp >= 50  and msrp < 100)     as p2,
    count(*) filter (where msrp >= 100 and msrp < 200)     as p3,
    count(*) filter (where msrp >= 200 and msrp < 999999)  as p4,
    count(*) filter (where community_rating >= 4)          as r4,
    count(*) filter (where community_rating >= 3)          as r3,
    count(*) filter (where community_rating >= 2)          as r2
  from public.bv_spirits
)
select 'category'::text as facet, category::text as value,
       null::numeric as lo, null::numeric as hi, count(*)::bigint as n
  from public.bv_spirits where category is not null group by category
union all
select 'country', country, null, null, count(*)::bigint
  from public.bv_spirits where country is not null group by country
union all
select 'price', 'Under $25', 0,   25,     p0 from bands
union all
select 'price', '$25 - $50', 25,  50,     p1 from bands
union all
select 'price', '$50 - $100', 50, 100,    p2 from bands
union all
select 'price', '$100 - $200', 100, 200,  p3 from bands
union all
select 'price', '$200+', 200, 999999,     p4 from bands
union all
select 'rating', '4+ Stars', 4, null,     r4 from bands
union all
select 'rating', '3+ Stars', 3, null,     r3 from bands
union all
select 'rating', '2+ Stars', 2, null,     r2 from bands;

-- Required for REFRESH ... CONCURRENTLY, which is what keeps the view readable
-- while it rebuilds. Without it a refresh takes an exclusive lock and search
-- blocks for the duration.
create unique index if not exists bv_spirit_facets_key
  on public.bv_spirit_facets (facet, value);

create index if not exists bv_spirit_facets_facet_idx
  on public.bv_spirit_facets (facet, n desc);

create or replace function public.refresh_bv_spirit_facets() returns void
language plpgsql security definer set search_path = public as $$
begin
  refresh materialized view concurrently public.bv_spirit_facets;
end $$;

grant select on public.bv_spirit_facets to anon, authenticated, service_role;
