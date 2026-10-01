/**
 * A unique id for a new card.
 *
 * Card ids are text rather than database-generated, so that ids coming from v1
 * survive the import unchanged - which is what keeps re-importing a deck
 * idempotent.
 *
 * crypto.randomUUID() is unavailable on pages served over plain http, which is
 * exactly how the app is reached when testing on a phone over the local
 * network. The fallback keeps that working; it is not a security feature and
 * does not need to be unguessable.
 */
export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}
