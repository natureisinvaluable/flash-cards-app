-- ============================================================================
-- Does the database really refuse a delete from anyone but the owner?
--
-- Run in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- Safe to run at any time: both checks happen inside transactions that are
-- rolled back, so nothing is created, changed or deleted for real.
--
-- Needs a second person to have signed in at least once, otherwise there is no
-- non-owner to impersonate and the first check proves less than it appears to.
--
-- Why this is needed at all: the SQL editor normally runs as a superuser,
-- which ignores every access rule. `set local role authenticated` steps down
-- to an ordinary signed-in user so the rules actually apply, and setting
-- request.jwt.claims is what tells the database WHICH user that is.
-- ============================================================================


-- Check 1: a non-owner tries to delete. Expect the card to survive.
begin;

insert into public.cards (id, english_text, portuguese_text)
values ('rls-delete-test', 'test card', 'cartao de teste');

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', (select id from public.profiles where is_owner = false limit 1),
    'role', 'authenticated'
  )::text,
  true
);
set local role authenticated;

delete from public.cards where id = 'rls-delete-test';

reset role;
select
  count(*) as should_be_1_card_survived,
  'A non-owner could NOT delete it - correct' as meaning
from public.cards where id = 'rls-delete-test';

rollback;


-- Check 2: the owner tries to delete. Expect the card to go.
begin;

insert into public.cards (id, english_text, portuguese_text)
values ('rls-delete-test', 'test card', 'cartao de teste');

select set_config(
  'request.jwt.claims',
  json_build_object(
    'sub', (select id from public.profiles where is_owner = true limit 1),
    'role', 'authenticated'
  )::text,
  true
);
set local role authenticated;

delete from public.cards where id = 'rls-delete-test';

reset role;
select
  count(*) as should_be_0_card_deleted,
  'The owner COULD delete it - correct' as meaning
from public.cards where id = 'rls-delete-test';

rollback;
