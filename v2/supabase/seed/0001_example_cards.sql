-- ============================================================================
-- Seed: a handful of cards so the shared pool is not empty.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- This is TEMPORARY CONTENT, not schema. These are the ten example cards that
-- shipped with v1, carrying their original ids - so when the full import
-- arrives later it will update these rows rather than duplicate them.
--
-- created_by is left null: nobody added these, they came with the app.
-- ============================================================================

insert into public.cards (id, english_text, english_spans, portuguese_text, portuguese_spans)
values
  ('example-o-c-o', 'the dog', '[]'::jsonb, 'o cão', '[{"start":0,"end":5,"colour":"blue"}]'::jsonb),
  ('example-a-ch-vena', 'the cup', '[]'::jsonb, 'a chávena', '[{"start":0,"end":9,"colour":"pink"}]'::jsonb),
  ('example-o-comboio', 'the train', '[]'::jsonb, 'o comboio', '[{"start":0,"end":9,"colour":"blue"}]'::jsonb),
  ('example-a-casa-de-banho', 'the bathroom', '[]'::jsonb, 'a casa de banho', '[{"start":0,"end":15,"colour":"pink"}]'::jsonb),
  ('example-o-pequeno-almo-o', 'breakfast', '[]'::jsonb, 'o pequeno-almoço', '[{"start":0,"end":16,"colour":"blue"}]'::jsonb),
  ('example-eu-falo', 'I speak', '[]'::jsonb, 'eu falo', '[{"start":6,"end":7,"colour":"green"}]'::jsonb),
  ('example-estou-a-falar', 'I am speaking', '[]'::jsonb, 'estou a falar', '[{"start":6,"end":13,"colour":"green"}]'::jsonb),
  ('example-eu-sou', 'I am (permanently)', '[]'::jsonb, 'eu sou', '[{"start":3,"end":6,"colour":"orange"}]'::jsonb),
  ('example-dif-cil', 'difficult', '[]'::jsonb, 'difícil', '[{"start":2,"end":4,"colour":"purple"}]'::jsonb),
  ('example-se-faz-favor', 'please', '[]'::jsonb, 'se faz favor', '[{"start":3,"end":12,"colour":"teal"}]'::jsonb)
on conflict (id) do nothing;
