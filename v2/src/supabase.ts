import { createClient } from '@supabase/supabase-js'
import { SUPABASE_PUBLISHABLE_KEY, SUPABASE_URL, isConfigured } from './config'

/**
 * The one connection to the database. Everything that reads or writes goes
 * through this, in the same spirit as v1's single storage module.
 */
export const supabase = createClient(
  isConfigured ? SUPABASE_URL : 'https://placeholder.supabase.co',
  isConfigured ? SUPABASE_PUBLISHABLE_KEY : 'placeholder-key',
)

/**
 * Where the magic link should send people back to.
 *
 * This must exactly match a URL allowed in the Supabase dashboard under
 * Authentication -> URL Configuration, or the link in the email will refuse to
 * sign anyone in. Using the live location means it works from both the
 * published site and a local preview without being hard-coded.
 */
export function redirectTarget(): string {
  return window.location.origin + window.location.pathname
}
