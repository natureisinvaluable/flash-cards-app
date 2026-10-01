-- ============================================================================
-- What the six colours mean, per person.
--
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- In v1 these labels were editable, and v2 must do everything v1 did. They
-- belong to the individual rather than the group: one person may use orange
-- for irregular verbs and another for words they keep forgetting, and neither
-- should change the other's.
--
-- Stored as JSON on the profile rather than as a table of their own. There are
-- exactly six, they are always read and written together, and nothing ever
-- needs to query across them - a table would be more machinery for no gain.
-- ============================================================================

alter table public.profiles
  add column colour_meanings jsonb not null default '[
    {"colour": "blue",   "label": "Masculine noun"},
    {"colour": "pink",   "label": "Feminine noun"},
    {"colour": "green",  "label": "Verb ending"},
    {"colour": "orange", "label": "Irregular"},
    {"colour": "purple", "label": "Stressed syllable"},
    {"colour": "teal",   "label": "Your own use"}
  ]'::jsonb;
