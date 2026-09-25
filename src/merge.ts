import type { AppData, Card, Category, ColourMeaning, Deletion } from './types'
import { SCHEMA_VERSION } from './exampleData'

/**
 * Combining the cards on this device with the cards in a backup file.
 *
 * One rule decides everything: for anything that exists in both, the version
 * edited most recently wins. Cards, categories and colour labels all follow it,
 * which is why every record has carried an `updatedAt` since the first day.
 *
 * Deletions are the exception that needs its own record. Without one, merging
 * would resurrect deleted cards forever: the other device still holds the card
 * and has no way to know it was removed on purpose. So deleting keeps a note of
 * when it happened, and an edit made AFTER that deletion still wins - which is
 * right, because it means someone deliberately worked on the card later.
 */

export interface MergeSummary {
  cardsAdded: number
  cardsUpdated: number
  cardsUnchanged: number
  cardsStayingDeleted: number
  categoriesAdded: number
}

export interface MergeResult {
  data: AppData
  summary: MergeSummary
}

function time(iso: string | undefined): number {
  if (!iso) return 0
  const parsed = Date.parse(iso)
  return Number.isNaN(parsed) ? 0 : parsed
}

function mergeDeletions(mine: Deletion[], theirs: Deletion[]): Deletion[] {
  const latest = new Map<string, Deletion>()
  for (const deletion of [...mine, ...theirs]) {
    const existing = latest.get(deletion.id)
    if (!existing || time(deletion.deletedAt) > time(existing.deletedAt)) {
      latest.set(deletion.id, deletion)
    }
  }
  return [...latest.values()]
}

/** Was this deliberately deleted more recently than it was last edited? */
function isDeleted(id: string, updatedAt: string, deletions: Map<string, number>): boolean {
  const deletedAt = deletions.get(id)
  return deletedAt !== undefined && deletedAt > time(updatedAt)
}

export function mergeData(mine: AppData, theirs: AppData): MergeResult {
  const deletions = mergeDeletions(mine.deletions ?? [], theirs.deletions ?? [])
  const deletedAt = new Map(deletions.map((d) => [d.id, time(d.deletedAt)]))

  const summary: MergeSummary = {
    cardsAdded: 0,
    cardsUpdated: 0,
    cardsUnchanged: 0,
    cardsStayingDeleted: 0,
    categoriesAdded: 0,
  }

  /* Cards ---------------------------------------------------------------- */

  const mineById = new Map(mine.cards.map((c) => [c.id, c]))
  const cards = new Map<string, Card>(mineById)

  for (const incoming of theirs.cards) {
    const existing = cards.get(incoming.id)
    if (!existing) {
      cards.set(incoming.id, incoming)
      summary.cardsAdded++
    } else if (time(incoming.updatedAt) > time(existing.updatedAt)) {
      cards.set(incoming.id, incoming)
      summary.cardsUpdated++
    } else {
      summary.cardsUnchanged++
    }
  }

  const survivingCards = [...cards.values()].filter((card) => {
    if (isDeleted(card.id, card.updatedAt, deletedAt)) {
      // Only count it as a surprise if the file was offering it back.
      if (!mineById.has(card.id)) summary.cardsStayingDeleted++
      return false
    }
    return true
  })
  // Anything dropped was never really added.
  summary.cardsAdded -= summary.cardsStayingDeleted

  /* Categories ------------------------------------------------------------ */

  const mineCategories = new Map(mine.categories.map((c) => [c.id, c]))
  const categories = new Map<string, Category>(mineCategories)

  for (const incoming of theirs.categories) {
    const existing = categories.get(incoming.id)
    if (!existing) {
      categories.set(incoming.id, incoming)
      summary.categoriesAdded++
    } else if (time(incoming.updatedAt) > time(existing.updatedAt)) {
      categories.set(incoming.id, incoming)
    }
  }

  let survivingCategories = [...categories.values()].filter((category) => {
    const gone = isDeleted(category.id, category.updatedAt, deletedAt)
    if (gone && !mineCategories.has(category.id)) summary.categoriesAdded--
    return !gone
  })

  // Every card has to live somewhere, so never end up with none.
  if (survivingCategories.length === 0) {
    survivingCategories = mine.categories.length > 0 ? mine.categories : theirs.categories
  }
  survivingCategories = [...survivingCategories].sort((a, b) => a.order - b.order)

  /* Cards whose category did not survive ---------------------------------- */

  const knownCategories = new Set(survivingCategories.map((c) => c.id))
  const fallback = survivingCategories[0].id
  const rehomedCards = survivingCards.map((card) =>
    knownCategories.has(card.categoryId) ? card : { ...card, categoryId: fallback },
  )

  /* Colour labels --------------------------------------------------------- */

  const colourMeanings: ColourMeaning[] = mine.colourMeanings.map((meaning) => {
    const incoming = theirs.colourMeanings.find((m) => m.colour === meaning.colour)
    if (incoming && time(incoming.updatedAt) > time(meaning.updatedAt)) return incoming
    return meaning
  })

  return {
    data: {
      schemaVersion: SCHEMA_VERSION,
      cards: rehomedCards,
      categories: survivingCategories,
      colourMeanings,
      deletions,
    },
    summary,
  }
}
