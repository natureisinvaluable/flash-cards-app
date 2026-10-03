import type { Card, CardState, Category } from './types'
import type { Profile } from './profile'

/**
 * A copy of what you last saw, kept on the device so the app has something to
 * show when there is no connection.
 *
 * This is a cache, not storage. The database is the truth; this is only ever
 * written from a successful load and is thrown away and rewritten each time.
 * Nothing is ever saved here that has not already been saved to the database,
 * so losing it costs nothing.
 */

export interface CachedLibrary {
  savedAt: string
  profile: Profile | null
  cards: Card[]
  categories: Category[]
  states: Record<string, CardState>
}

const KEY = 'flashcards-v2-cache'

/** Keyed by person, so two accounts on one device never see each other's. */
function keyFor(userId: string): string {
  return `${KEY}:${userId}`
}

export function saveCache(userId: string, library: Omit<CachedLibrary, 'savedAt'>): void {
  try {
    localStorage.setItem(
      keyFor(userId),
      JSON.stringify({ ...library, savedAt: new Date().toISOString() }),
    )
  } catch {
    // Storage full or blocked. Being unable to work offline is not worth
    // interrupting anyone over.
  }
}

export function loadCache(userId: string): CachedLibrary | null {
  try {
    const raw = localStorage.getItem(keyFor(userId))
    if (!raw) return null
    const parsed = JSON.parse(raw) as CachedLibrary
    if (!Array.isArray(parsed.cards) || !Array.isArray(parsed.categories)) return null
    return parsed
  } catch {
    return null
  }
}
