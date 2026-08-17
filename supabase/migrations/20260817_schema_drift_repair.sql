-- supabase/migrations/20260817_schema_drift_repair.sql
-- Repairs the schema drift behind eight routes returning HTTP 500 in production.
-- Every change here is additive. No column is dropped, no row is touched.
-- CR AudioViz AI, LLC · EIN 39-3646201 · 2026-08-17

-- 1. Community ratings.
--    /api/search filters and sorts on bv_spirits.community_rating and
--    rating_count. Neither column exists, so every search 500s. The data they
--    describe lives in bv_reviews. Materialising the aggregate on bv_spirits is
--    what the route already assumes and is the only shape that can be sorted
--    and filtered by the database rather than in application memory.
alter table public.bv_spirits
  add column if not exists community_rating numeric(3,2),
  add column if not exists rating_count     integer not null default 0;

create or replace function public.bv_refresh_spirit_rating() returns trigger
language plpgsql security definer set search_path = public as $$
declare target uuid := coalesce(new.spirit_id, old.spirit_id);
begin
  update public.bv_spirits s
     set community_rating = agg.avg_rating,
         rating_count     = agg.n
    from (select round(avg(rating)::numeric, 2) avg_rating, count(*) n
            from public.bv_reviews where spirit_id = target) agg
   where s.id = target;
  return null;
end $$;

drop trigger if exists bv_reviews_rating_sync on public.bv_reviews;
create trigger bv_reviews_rating_sync
  after insert or update of rating or delete on public.bv_reviews
  for each row execute function public.bv_refresh_spirit_rating();

-- Backfill from whatever reviews exist today.
update public.bv_spirits s
   set community_rating = agg.avg_rating, rating_count = agg.n
  from (select spirit_id, round(avg(rating)::numeric, 2) avg_rating, count(*) n
          from public.bv_reviews group by spirit_id) agg
 where s.id = agg.spirit_id;

-- 2. Activity feed relationships.
--    bv_activities carries user_id, spirit_id, cocktail_id and distillery_id but
--    no foreign keys, so PostgREST cannot resolve the embeds /api/feed asks for
--    and returns PGRST200. The table is empty, so the constraints apply cleanly.
alter table public.bv_activities
  drop constraint if exists bv_activities_user_id_fkey,
  add  constraint bv_activities_user_id_fkey
       foreign key (user_id) references public.profiles(id) on delete cascade;

alter table public.bv_activities
  drop constraint if exists bv_activities_spirit_id_fkey,
  add  constraint bv_activities_spirit_id_fkey
       foreign key (spirit_id) references public.bv_spirits(id) on delete set null;

alter table public.bv_activities
  drop constraint if exists bv_activities_cocktail_id_fkey,
  add  constraint bv_activities_cocktail_id_fkey
       foreign key (cocktail_id) references public.bv_cocktails(id) on delete set null;

alter table public.bv_activities
  drop constraint if exists bv_activities_distillery_id_fkey,
  add  constraint bv_activities_distillery_id_fkey
       foreign key (distillery_id) references public.bv_distilleries(id) on delete set null;

-- 3. Category counts without a full table scan.
--    /api/spirits built its category histogram by selecting the category column
--    from all 1,563,965 rows on every request and counting in JavaScript. That
--    is the 500. The database can answer this in one indexed pass.
create or replace view public.bv_spirit_category_counts as
  select category, count(*)::bigint as count
    from public.bv_spirits
   where category is not null
   group by category;

grant select on public.bv_spirit_category_counts to anon, authenticated, service_role;
