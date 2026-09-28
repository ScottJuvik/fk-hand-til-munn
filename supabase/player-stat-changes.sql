-- History of player stat changes, shown in the ticker on /players.
--
-- Triggers on `players` and `player_stats` add a row for every tracked
-- number that changes, however it's changed: the admin, the Supabase
-- dashboard or a script. The tracked columns are the trigger arguments
-- below; keep them in sync with STAT_LABELS in lib/player-stat-changes.ts.
--
-- Locked down like every other table (see enable-rls.sql): only the
-- website's server, using the service-role key, can read or write it.
--
-- Run once in Supabase: Dashboard -> SQL Editor -> paste -> Run.
-- Safe to run again.

create table if not exists public.player_stat_changes (
  id bigint generated always as identity primary key,
  player_id integer not null references public.players(id) on delete cascade,
  stat text not null,
  old_value integer not null,
  new_value integer not null,
  created_at timestamptz not null default now()
);

create index if not exists player_stat_changes_created_at_idx
  on public.player_stat_changes (created_at desc);

alter table public.player_stat_changes enable row level security;
revoke all on public.player_stat_changes from anon, authenticated;

-- Compares the columns named in the trigger arguments between the old and
-- new row, and records each one that changed.
create or replace function public.record_player_stat_changes()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  old_row jsonb := to_jsonb(old);
  new_row jsonb := to_jsonb(new);
  -- player_stats rows have a player_id; players rows are the player.
  target_player_id integer := coalesce((new_row ->> 'player_id')::integer, (new_row ->> 'id')::integer);
  col text;
begin
  foreach col in array tg_argv loop
    if old_row ->> col is not null
       and new_row ->> col is not null
       and old_row ->> col is distinct from new_row ->> col then
      insert into public.player_stat_changes (player_id, stat, old_value, new_value)
      values (target_player_id, col, (old_row ->> col)::integer, (new_row ->> col)::integer);
    end if;
  end loop;
  return new;
exception when others then
  -- The history is extra: never let it block saving a player.
  raise warning 'record_player_stat_changes: %', sqlerrm;
  return new;
end;
$$;

revoke execute on function public.record_player_stat_changes() from public, anon, authenticated;

drop trigger if exists record_player_stat_changes on public.players;
create trigger record_player_stat_changes
  after update on public.players
  for each row
  execute function public.record_player_stat_changes('rating', 'weak_foot', 'skill_moves');

drop trigger if exists record_player_stat_changes on public.player_stats;
create trigger record_player_stat_changes
  after update on public.player_stats
  for each row
  execute function public.record_player_stat_changes(
    'pace', 'shooting', 'passing', 'dribbling', 'defending', 'physical',
    'acceleration', 'sprint_speed', 'positioning', 'finishing', 'shot_power', 'long_shots',
    'vision', 'crossing', 'free_kick', 'short_passing', 'long_passing', 'curve',
    'agility', 'balance', 'reactions', 'ball_control', 'composure', 'interceptions',
    'heading_accuracy', 'marking', 'standing_tackle', 'sliding_tackle', 'jumping',
    'stamina', 'strength', 'aggression'
  );
