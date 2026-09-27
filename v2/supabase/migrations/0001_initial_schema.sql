-- ============================================================================
-- v2 initial schema
--
-- Run this once, in the Supabase dashboard: SQL Editor -> New query -> paste
-- -> Run. It is safe to run on an empty project and only on an empty project.
--
-- NEVER edit this file after it has been applied. Add a new numbered migration
-- instead. The owner cannot recover data lost to a rewritten migration.
--
-- The shape, in one paragraph: cards are shared by everyone, but what you
-- think of a card is yours alone. So `cards` holds the words, and
-- `card_states` holds one row per person per card saying which of THEIR
-- categories it sits in and when they last saw it.
-- ============================================================================

-- ---------------------------------------------------------------- profiles --
-- One row per person, created automatically when they first sign in.

create table public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  display_name text        not null default '',
  -- Only the owner may delete cards from the shared pool.
  is_owner     boolean     not null default false,
  created_at   timestamptz not null default now()
);

-- ------------------------------------------------------------------- cards --
-- The shared pool. Text and colour ranges are stored exactly as in v1: plain
-- text, with colours held separately as {start, end, colour} positions.
--
-- The id is TEXT, not a generated uuid, so that ids from v1 survive the import
-- unchanged. That is what keeps re-importing a deck idempotent rather than
-- duplicating every card.

create table public.cards (
  id               text        primary key,
  english_text     text        not null,
  english_spans    jsonb       not null default '[]'::jsonb,
  portuguese_text  text        not null,
  portuguese_spans jsonb       not null default '[]'::jsonb,
  created_by       uuid        references public.profiles (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- -------------------------------------------------------------- categories --
-- Each person's own buckets. Two people may both have "Know well"; they are
-- different rows and entirely independent.

create table public.categories (
  id         uuid        primary key default gen_random_uuid(),
  user_id    uuid        not null references public.profiles (id) on delete cascade,
  name       text        not null,
  sort_order integer     not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index categories_user_id_idx on public.categories (user_id);

-- ------------------------------------------------------------- card_states --
-- What one person thinks of one card. No row means "unsorted": nobody has
-- judged it yet, which is the normal state of a card someone else just added.

create table public.card_states (
  user_id        uuid        not null references public.profiles (id) on delete cascade,
  card_id        text        not null references public.cards (id) on delete cascade,
  category_id    uuid        references public.categories (id) on delete set null,
  last_viewed_at timestamptz,
  updated_at     timestamptz not null default now(),
  primary key (user_id, card_id)
);

create index card_states_user_id_idx on public.card_states (user_id);

-- ================================================================= helpers ==

-- Keep updated_at honest without relying on every client remembering to set it.
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger cards_touch       before update on public.cards       for each row execute function public.touch_updated_at();
create trigger categories_touch  before update on public.categories  for each row execute function public.touch_updated_at();
create trigger card_states_touch before update on public.card_states for each row execute function public.touch_updated_at();

-- Is the person making this request the owner?
--
-- SECURITY DEFINER matters: this reads `profiles`, and without it the check
-- would itself be filtered by the policies on `profiles` and recurse.
create or replace function public.is_owner()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce((select is_owner from public.profiles where id = auth.uid()), false);
$$;

-- New sign-in: create the profile and a starting set of categories.
--
-- The FIRST person to sign in becomes the owner. Sign-ups are closed, so that
-- is the owner signing in before inviting anyone. If it ever goes wrong it can
-- be corrected with:
--   update public.profiles set is_owner = true where id = '<the right uuid>';
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  first_user boolean;
begin
  select not exists (select 1 from public.profiles) into first_user;

  insert into public.profiles (id, display_name, is_owner)
  values (new.id, split_part(new.email, '@', 1), first_user);

  insert into public.categories (user_id, name, sort_order) values
    (new.id, 'Don''t know',    0),
    (new.id, 'Know a little',  1),
    (new.id, 'Know well',      2);

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================== access rules ==
--
-- These are the whole game. The app carries a key that anyone can read out of
-- the page, so what protects this data is these policies and nothing else.
-- A table with RLS left off is readable and writable by the entire internet.

alter table public.profiles    enable row level security;
alter table public.cards       enable row level security;
alter table public.categories  enable row level security;
alter table public.card_states enable row level security;

-- profiles: everyone signed in can see who is who. Nobody inserts directly;
-- the trigger above does it.
create policy "signed in can read profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "you can rename yourself"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- ...but you cannot promote yourself to owner. The policy above would
-- otherwise allow it, since it only checks WHICH row you are editing.
create or replace function public.protect_is_owner()
returns trigger
language plpgsql
as $$
begin
  if new.is_owner is distinct from old.is_owner and not public.is_owner() then
    raise exception 'only the owner can change owner status';
  end if;
  return new;
end;
$$;

create trigger profiles_protect_is_owner
  before update on public.profiles
  for each row execute function public.protect_is_owner();

-- cards: shared. Anyone signed in may read, add and correct.
create policy "signed in can read cards"
  on public.cards for select
  to authenticated
  using (true);

create policy "signed in can add cards"
  on public.cards for insert
  to authenticated
  with check (created_by = auth.uid());

create policy "signed in can edit cards"
  on public.cards for update
  to authenticated
  using (true)
  with check (true);

-- ...but only the owner may delete one. This is the rule that protects the
-- shared pool from an accidental wipe, and it lives here rather than in a
-- hidden button because a hidden button protects nothing.
create policy "only the owner can delete cards"
  on public.cards for delete
  to authenticated
  using (public.is_owner());

-- categories and card_states: strictly your own.
create policy "your own categories"
  on public.categories for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "your own card states"
  on public.card_states for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
