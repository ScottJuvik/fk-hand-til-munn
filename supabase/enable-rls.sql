-- Lock the database down so only the website's server can use it.
--
-- The site reads and writes through server code using the service-role key,
-- which bypasses Row Level Security. Browsers never talk to Supabase
-- directly any more, so the public "anon" key needs no access at all.
--
-- Enabling RLS with no policies means every request made with the anon key
-- (or any logged-in Supabase user) is rejected, while the server keeps
-- working exactly as before.
--
-- Run once in Supabase: Dashboard -> SQL Editor -> paste -> Run.
-- Safe to run again.

do $$
declare
  t record;
  p record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
  -- Drop any old "allow everyone" policies so nothing stays open.
  for p in select policyname, tablename from pg_policies where schemaname = 'public' loop
    execute format('drop policy %I on public.%I', p.policyname, p.tablename);
  end loop;
end $$;

-- Belt and braces: the anon and authenticated roles get no table rights.
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from anon, authenticated;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from anon, authenticated;

-- Check: every table should show rowsecurity = true and no policies.
select tablename, rowsecurity,
       (select count(*) from pg_policies p where p.schemaname = 'public' and p.tablename = t.tablename) as policies
from pg_tables t
where schemaname = 'public'
order by tablename;
