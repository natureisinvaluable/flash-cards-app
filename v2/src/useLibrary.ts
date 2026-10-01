import { useCallback, useEffect, useState } from 'react'
import type { Card, CardState, Category } from './types'
import { fetchCards } from './cards'
import { fetchCategories, addCategory, renameCategory, swapCategoryOrder, deleteCategory } from './categories'
import { fetchCardStates, setCardCategory } from './cardStates'

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
  const [cards, setCards] = useState<Card[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [states, setStates] = useState<Record<string, CardState>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const reload = useCallback(async () => {
    try {
      const [loadedCards, loadedCategories, loadedStates] = await Promise.all([
        fetchCards(),
        fetchCategories(),
        fetchCardStates(),
      ])
      setCards(loadedCards)
      setCategories(loadedCategories)
      setStates(loadedStates)
      setError(null)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    reload()
  }, [reload])

  const fileCard = useCallback(
    async (cardId: string, categoryId: string | null) => {
      const previous = states[cardId]
      setStates((current) => ({
        ...current,
        [cardId]: { cardId, categoryId, lastViewedAt: previous?.lastViewedAt ?? null },
      }))
      try {
        await setCardCategory(userId, cardId, categoryId)
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

  return {
    cards,
    categories: [...categories].sort((a, b) => a.sortOrder - b.sortOrder),
    states,
    loading,
    error,
    dismissError: () => setError(null),
    fileCard,
    createCategory,
    rename,
    move,
    remove,
  }
}
