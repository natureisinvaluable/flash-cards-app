/**
 * Where this app's database lives.
 *
 * Both values below are PUBLIC by design. The publishable key is embedded in every
 * copy of the app and anyone can read it out of the page. That is safe only
 * because every table has row level security switched on, so the key grants
 * nothing on its own - it still has to be accompanied by a signed-in user, and
 * the database decides what that user may see.
 *
 * NEVER put the secret key here, or anywhere in this repository. That is the
 * one starting `sb_secret_` (formerly `service_role`), and it bypasses every
 * access rule in the database.
 */

export const SUPABASE_URL = 'https://fwiumichrtlulpegjsfg.supabase.co'
export const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_uPnw9vNkNRL_JK_kQC-w3Q_w0Si5C0Q'

export const isConfigured =
  SUPABASE_URL.startsWith('https://') && SUPABASE_PUBLISHABLE_KEY.length > 20
