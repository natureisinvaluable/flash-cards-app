import { useCallback, useEffect, useState } from 'react'
import type { Card, CardState, Category } from './types'
import { fetchCards, createCard, updateCard, deleteCard } from './cards'
import { fetchProfile, type Profile } from './profile'
import { fetchCategories, addCategory, renameCategory, swapCategoryOrder, deleteCategory } from './categories'
import { fetchCardStates, upsertCardState } from './cardStates'

/**
 * Everything on screen: the shared cards, your categories, and your view of
 * each card.
 *
 * Filing a card updates the screen immediately and saves in the background. If
 * the save fails the change is put back and an error is shown - a card that
 * silently un-files itself on the next reload would be worse than one that
 * says it could not be moved.
 */
export function useLibrary(userId: string) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [cards, setCards] = useState<Card[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [states, setStates] = useState<Record<string, CardState>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      const [loadedProfile, loadedCards, loadedCategories, loadedStates] = await Promise.all([
        fetchProfile(userId),
        fetchCards(),
        fetchCategories(),
        fetchCardStates(),
      ])
      setProfile(loadedProfile)
      setCards(loadedCards)
      setCategories(loadedCategories)
      setStates(loadedStates)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    reload()
  }, [reload])

  /**
   * Pick up other people's changes when you come back to the tab.
   *
   * The cards are shared, but the app only reads them when it starts - so a
   * card a friend adds while your tab sits open stays invisible until you
   * reload. Refreshing when the window regains focus covers the ordinary case
   * of switching between devices or browsers without anyone needing to know
   * that a reload was required.
   *
   * This is not live updating: two people with the app open side by side still
   * will not see each other type. That needs a live connection to the database
   * and is a bigger change than it looks.
   */
  useEffect(() => {
    function refreshOnReturn() {
      if (document.visibilityState === 'visible') reload()
    }
    window.addEventListener('focus', refreshOnReturn)
    document.addEventListener('visibilitychange', refreshOnReturn)
    return () => {
      window.removeEventListener('focus', refreshOnReturn)
      document.removeEventListener('visibilitychange', refreshOnReturn)
    }
  }, [reload])

  const fileCard = useCallback(
    async (cardId: string, categoryId: string | null) => {
      const previous = states[cardId]
      setStates((current) => ({
        ...current,
        [cardId]: { cardId, categoryId, lastViewedAt: previous?.lastViewedAt ?? null },
      }))
      try {
        await upsertCardState(userId, cardId, {
          categoryId,
          lastViewedAt: previous?.lastViewedAt ?? null,
        })
      } catch (e) {
        setStates((current) => {
          const reverted = { ...current }
          if (previous) reverted[cardId] = previous
          else delete reverted[cardId]
          return reverted
        })
        setError(`Could not move that card: ${(e as Error).message}`)
      }
    },
    [states, userId],
  )

  /**
   * Note that you have just looked at a card, so "least recently seen" can
   * order a later session.
   *
   * Deliberately quiet: a failure here is not worth interrupting a study
   * session for. The worst case is a card keeping an older date and coming
   * round again sooner than it needed to.
   */
  const markViewed = useCallback(
    async (cardId: string) => {
      const seenAt = new Date().toISOString()
      const categoryId = states[cardId]?.categoryId ?? null
      setStates((current) => ({
        ...current,
        [cardId]: { cardId, categoryId, lastViewedAt: seenAt },
      }))
      try {
        await upsertCardState(userId, cardId, { categoryId, lastViewedAt: seenAt })
      } catch {
        // left as it was on screen; it will correct itself on the next load
      }
    },
    [states, userId],
  )

  const createCategory = useCallback(
    async (name: string) => {
      try {
        const created = await addCategory(userId, name, categories.length)
        setCategories((current) => [...current, created])
      } catch (e) {
        setError((e as Error).message)
      }
    },
    [categories.length, userId],
  )

  const rename = useCallback(async (id: string, name: string) => {
    setCategories((current) => current.map((c) => (c.id === id ? { ...c, name } : c)))
    try {
      await renameCategory(id, name)
    } catch (e) {
      setError((e as Error).message)
    }
  }, [])

  const move = useCallback(
    async (id: string, direction: -1 | 1) => {
      const ordered = [...categories].sort((a, b) => a.sortOrder - b.sortOrder)
      const index = ordered.findIndex((c) => c.id === id)
      const target = index + direction
      if (index === -1 || target < 0 || target >= ordered.length) return

      const a = ordered[index]
      const b = ordered[target]
      setCategories((current) =>
        current.map((c) =>
          c.id === a.id ? { ...c, sortOrder: b.sortOrder } : c.id === b.id ? { ...c, sortOrder: a.sortOrder } : c,
        ),
      )
      try {
        await swapCategoryOrder(a, b)
      } catch (e) {
        setError((e as Error).message)
        reload()
      }
    },
    [categories, reload],
  )

  const remove = useCallback(
    async (id: string, moveCardsTo: string | null) => {
      try {
        await deleteCategory(userId, id, moveCardsTo)
        await reload()
      } catch (e) {
        setError((e as Error).message)
      }
    },
    [reload, userId],
  )

  const saveCard = useCallback(
    async (
      existing: Card | null,
      english: Card['english'],
      portuguese: Card['portuguese'],
      categoryId: string | null,
    ) => {
      const saved = existing
        ? await updateCard(existing.id, english, portuguese)
        : await createCard(userId, english, portuguese)

      setCards((current) =>
        existing ? current.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...current],
      )

      // The category is the creator's own filing, not part of the shared card.
      const alreadyThere = (states[saved.id]?.categoryId ?? null) === categoryId
      if (!alreadyThere) await fileCard(saved.id, categoryId)
    },
    [fileCard, states, userId],
  )

  /**
   * Delete a card for everyone. Only the owner can do this, and the database
   * is what enforces it - the hidden button is a courtesy, not the protection.
   */
  const removeCard = useCallback(async (cardId: string) => {
    await deleteCard(cardId)
    setCards((current) => current.filter((c) => c.id !== cardId))
    setStates((current) => {
      const next = { ...current }
      delete next[cardId]
      return next
    })
  }, [])

  return {
    profile,
    cards,
    categories: [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    states,
    loading,
    error,
    dismissError: () => setError(null),
    refresh: reload,
    fileCard,
    markViewed,
    saveCard,
    removeCard,
    createCategory,
    rename,
    move,
    remove,
  }
}
