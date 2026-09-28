-- Keep `updated_at` current on the tables the admin edits, so it can be used
-- as a version: an edit page sends the `updated_at` it loaded, and the API
-- refuses the save (409) if the row has changed since, instead of silently
-- overwriting someone else's edit.
--
-- Only a real change bumps it, so a save that changes nothing (or clearing
-- is_active on lineups that are already inactive) doesn't look like an edit.
-- A save can also bump it on purpose by setting updated_at, e.g. a lineup
-- whose players (a separate table) changed.
--
-- Run once in Supabase: Dashboard -> SQL Editor -> paste -> Run.
-- Safe to run again.

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  -- Compared as jsonb: some column types have no equality operator.
  if new.updated_at is distinct from old.updated_at
     or to_jsonb(new) - 'updated_at' is distinct from to_jsonb(old) - 'updated_at' then
    new.updated_at := now();
  end if;
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public, anon, authenticated;

do $$
declare
  t text;
begin
  foreach t in array array['players', 'player_stats', 'news_articles', 'lineups', 'matches'] loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format(
      'create trigger set_updated_at before update on public.%I for each row execute function public.set_updated_at()',
      t
    );
  end loop;
end $$;
