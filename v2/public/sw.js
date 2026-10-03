/*
 * Keeps a copy of the app on the device so it opens with no connection -
 * on a plane, on the underground, or anywhere the signal has gone.
 *
 * This only makes the APP available offline. The cards themselves are cached
 * separately by the app, in ordinary browser storage.
 *
 * Written by hand rather than with a library: it is forty lines, and this
 * project prefers writing a few lines to taking on a dependency.
 *
 * The rules:
 *
 *  - The page itself: try the network first, fall back to the stored copy.
 *    That way a new version is picked up as soon as there is a connection,
 *    rather than the app being stuck on an old one - the classic and
 *    maddening failure of offline-capable web apps.
 *
 *  - Scripts, styles and other files: serve the stored copy immediately, and
 *    quietly fetch a fresh one in the background for next time. These have
 *    content-based names, so a changed file is a different name and can never
 *    be served stale.
 *
 *  - Anything from the database: not touched at all. Requests to Supabase go
 *    to a different address, so they never reach this code, and cached card
 *    data would go stale in ways nobody could see.
 */

const CACHE = 'flashcards-v2-app-v1'

self.addEventListener('install', (event) => {
  // Take over straight away rather than waiting for every tab to close.
  self.skipWaiting()
  event.waitUntil(caches.open(CACHE))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys()
      await Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name)))
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request

  if (request.method !== 'GET') return
  if (new URL(request.url).origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const fresh = await fetch(request)
          const cache = await caches.open(CACHE)
          cache.put(request, fresh.clone())
          return fresh
        } catch {
          const cached = await caches.match(request)
          if (cached) return cached
          // A page we have never visited, with no connection to fetch it.
          const fallback = await caches.match(self.registration.scope)
          if (fallback) return fallback
          throw new Error('offline and this page is not stored')
        }
      })(),
    )
    return
  }

  event.respondWith(
    (async () => {
      const cached = await caches.match(request)
      const network = fetch(request)
        .then(async (response) => {
          if (response && response.ok) {
            const cache = await caches.open(CACHE)
            cache.put(request, response.clone())
          }
          return response
        })
        .catch(() => undefined)

      return cached ?? (await network) ?? Response.error()
    })(),
  )
})
