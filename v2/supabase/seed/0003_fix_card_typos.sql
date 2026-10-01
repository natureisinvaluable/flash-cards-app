-- ============================================================================
-- Nine corrections to cards, found while reviewing the collection.
--
-- Run AFTER the import, in the Supabase dashboard: SQL Editor -> New query
-- -> paste -> Run.
--
-- Each update is keyed on BOTH the card id and its exact current text. If a
-- card has already been corrected, or edited by someone else in the meantime,
-- that statement simply matches nothing rather than overwriting a newer
-- version. Running this twice is harmless.
--
-- Colour positions were checked first: the two cards whose text changes length
-- carry no colour, and the two that do carry colour keep the same length, so
-- every coloured range still covers the same word.
-- ============================================================================

-- nosso -> nossa; volta is feminine
--   'à nosso volta'  ->  'à nossa volta'
update public.cards set portuguese_text = 'à nossa volta'
  where id = '95ac2df5-ca51-4244-add7-611cd17e7bf8' and portuguese_text = 'à nosso volta';

-- missing cedilla
--   'a relacão'  ->  'a relação'
update public.cards set portuguese_text = 'a relação'
  where id = '964bffaa-a851-4be2-8a16-b8658d01e501' and portuguese_text = 'a relacão';

-- apartemento -> apartamento
--   'Arrendamos nosso apartemento a outras pessoas'  ->  'Arrendamos nosso apartamento a outras pessoas'
update public.cards set portuguese_text = 'Arrendamos nosso apartamento a outras pessoas'
  where id = '4e9a216c-fcea-41c5-a424-2920923c584a' and portuguese_text = 'Arrendamos nosso apartemento a outras pessoas';

-- estiva -> estive, the past of estar
--   'Nunca estiva lá'  ->  'Nunca estive lá'
update public.cards set portuguese_text = 'Nunca estive lá'
  where id = '087502d9-a1f8-4e35-bd86-77377f4f872f' and portuguese_text = 'Nunca estiva lá';

-- infelizamente -> infelizmente
--   'infelizamente'  ->  'infelizmente'
update public.cards set portuguese_text = 'infelizmente'
  where id = 'afa0c501-91a2-480c-a9f6-e0dd50e7663c' and portuguese_text = 'infelizamente';

-- semelhente -> semelhante
--   'é semelhente a'  ->  'é semelhante a'
update public.cards set portuguese_text = 'é semelhante a
é parecida com'
  where id = '81c3ca5d-aa06-463d-9c17-f7e6b076c81a' and portuguese_text = 'é semelhente a
é parecida com';

-- Canada -> Canadá
--   'Nasci no Canada'  ->  'Nasci no Canadá'
update public.cards set portuguese_text = 'Nasci no Canadá'
  where id = '847404ab-3425-4dfc-8a8b-b77d9ab3b08d' and portuguese_text = 'Nasci no Canada';

-- muta is not a word
--   'estava em muta'  ->  'estava em mudo'
update public.cards set portuguese_text = 'estava em mudo'
  where id = 'f11b9eba-5f67-4ae9-8ed3-4134004f7d86' and portuguese_text = 'estava em muta';

-- Algarve cannot be the subject of estar calor
--   'O Algarve não está muito calor'  ->  'O Algarve não é muito quente'
update public.cards set portuguese_text = 'O Algarve não é muito quente'
  where id = 'a913c1ae-1be2-4fe8-97dd-dacd3e7f5b00' and portuguese_text = 'O Algarve não está muito calor';

-- Check: all nine should be listed below with their corrected text.
select portuguese_text
from public.cards
where id in (
  '95ac2df5-ca51-4244-add7-611cd17e7bf8',
  '964bffaa-a851-4be2-8a16-b8658d01e501',
  '4e9a216c-fcea-41c5-a424-2920923c584a',
  '087502d9-a1f8-4e35-bd86-77377f4f872f',
  'afa0c501-91a2-480c-a9f6-e0dd50e7663c',
  '81c3ca5d-aa06-463d-9c17-f7e6b076c81a',
  '847404ab-3425-4dfc-8a8b-b77d9ab3b08d',
  'f11b9eba-5f67-4ae9-8ed3-4134004f7d86',
  'a913c1ae-1be2-4fe8-97dd-dacd3e7f5b00'
);
