-- ============================================================================
-- Remove the ten example cards seeded at Stage 2.
--
-- Run in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- They were only ever there so the shared pool was not empty to look at. The
-- owner had already removed them from v1, so they do not appear in the import
-- and would otherwise linger.
--
-- Deleting a card also removes how everyone had filed it, by design.
-- ============================================================================

delete from public.cards where id like 'example-%';
