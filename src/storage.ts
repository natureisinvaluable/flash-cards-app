import type { AppData, Card, CardSide, Category, ColourId } from './types'
import { SCHEMA_VERSION, initialData } from './exampleData'

/**
 * The ONE place that reads and writes saved data. No component should touch
 * localStorage directly (see CLAUDE.md).
 *
 * If cross-device sync is ever added, it should arrive as a second
 * implementation of the functions below, not as storage code spread through
 * the app.
 */

const STORAGE_KEY = 'flashcards'

function now(): string {
  return new Date().toISOString()
}

/**
 * A unique id.
 *
 * crypto.randomUUID() is unavailable on pages served over plain http, which is
 * exactly how the app is reached when testing on a phone over the home wifi
 * (http://192.168.x.x). The fallback keeps that working; it is not a security
 * feature and does not need to be unguessable.
 */
export function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `id-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

/** Bring older saved data up to the current shape. */
function migrate(data: AppData): AppData {
  // Only one schema version exists so far. When that changes, add the steps
  // here rather than discarding data the owner cannot get back.
  return { ...data, schemaVersion: SCHEMA_VERSION }
}

function isPlausible(value: unknown): value is AppData {
  if (typeof value !== 'object' || value === null) return false
  const d = value as Partial<AppData>
  return Array.isArray(d.cards) && Array.isArray(d.categories)
}

/**
 * Load everything. On a first visit, or if the saved data is unreadable,
 * returns the example cards instead.
 */
export function loadData(): AppData {
  let raw: string | null = null
  try {
    raw = localStorage.getItem(STORAGE_KEY)
  } catch {
    // Private browsing or blocked site data: carry on in memory for this visit.
    return initialData(now())
  }

  if (raw === null) return initialData(now())

  try {
    const parsed: unknown = JSON.parse(raw)
    if (!isPlausible(parsed)) return initialData(now())
    return migrate(parsed)
  } catch {
    return initialData(now())
  }
}

/** Save everything. Returns false if the browser refused to store it. */
export function saveData(data: AppData): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    return true
  } catch {
    return false
  }
}

/* -------------------------------------------------------------------------
   Operations. Each takes the current data and returns new data, leaving the
   caller to save it. Keeping them pure makes them easy to reason about and
   easy to test later.
   ------------------------------------------------------------------------- */

export function addCard(
  data: AppData,
  english: CardSide,
  portuguese: CardSide,
  categoryId: string,
): AppData {
  const stamp = now()
  const card: Card = {
    id: newId(),
    english,
    portuguese,
    categoryId,
    createdAt: stamp,
    updatedAt: stamp,
  }
  return { ...data, cards: [card, ...data.cards] }
}

export function updateCard(data: AppData, id: string, changes: Partial<Omit<Card, 'id'>>): AppData {
  return {
    ...data,
    cards: data.cards.map((c) => (c.id === id ? { ...c, ...changes, updatedAt: now() } : c)),
  }
}

export function deleteCard(data: AppData, id: string): AppData {
  return { ...data, cards: data.cards.filter((c) => c.id !== id) }
}

export function setCardCategory(data: AppData, id: string, categoryId: string): AppData {
  return updateCard(data, id, { categoryId })
}

export function removeExampleCards(data: AppData): AppData {
  return { ...data, cards: data.cards.filter((c) => !c.isExample) }
}

export function hasExampleCards(data: AppData): boolean {
  return data.cards.some((c) => c.isExample)
}

export function addCategory(data: AppData, name: string): AppData {
  const stamp = now()
  const category: Category = {
    id: newId(),
    name,
    order: data.categories.length,
    createdAt: stamp,
    updatedAt: stamp,
  }
  return { ...data, categories: [...data.categories, category] }
}

export function renameCategory(data: AppData, id: string, name: string): AppData {
  return {
    ...data,
    categories: data.categories.map((c) => (c.id === id ? { ...c, name, updatedAt: now() } : c)),
  }
}

/**
 * Remove a category, moving its cards elsewhere. The last remaining category
 * cannot be deleted, because every card must sit somewhere.
 */
export function deleteCategory(data: AppData, id: string, moveCardsTo: string): AppData {
  if (data.categories.length <= 1) return data
  return {
    ...data,
    categories: data.categories.filter((c) => c.id !== id),
    cards: data.cards.map((c) =>
      c.categoryId === id ? { ...c, categoryId: moveCardsTo, updatedAt: now() } : c,
    ),
  }
}

export function setColourMeaning(data: AppData, colour: ColourId, label: string): AppData {
  return {
    ...data,
    colourMeanings: data.colourMeanings.map((m) => (m.colour === colour ? { ...m, label } : m)),
  }
}

export function sortedCategories(data: AppData): Category[] {
  return [...data.categories].sort((a, b) => a.order - b.order)
}
