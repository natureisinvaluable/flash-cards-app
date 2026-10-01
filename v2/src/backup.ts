import type { Card, CardState, Category } from './types'
import type { ColourMeaning } from './profile'

/**
 * Exporting everything to a file.
 *
 * The file is written in V1'S BACKUP FORMAT, deliberately. That does two jobs
 * at once:
 *
 *  - It is a safety net. The shared pool otherwise exists only inside one
 *    Supabase project, and the free tier carries no guaranteed backups. This
 *    file is the only copy that lives anywhere else.
 *  - It is a way out. If v2 or Supabase ever went away, this file can be
 *    opened straight into v1, which still works and still runs entirely in
 *    the browser. The cards are not trapped in here.
 *
 * What it captures is YOUR view: every shared card, filed the way you have
 * filed it. Other people's categories are theirs and are not in the file -
 * the database would not hand them over, and they would mean nothing to v1.
 */

interface ExportedSide {
  text: string
  spans: Card['english']['spans']
}

interface ExportedCard {
  id: string
  english: ExportedSide
  portuguese: ExportedSide
  categoryId: string
  createdAt: string
  updatedAt: string
}

export function backupFilename(date = new Date()): string {
  return `portuguese-flashcards-v2-backup-${date.toISOString().slice(0, 10)}.json`
}

export function toBackupJson(
  cards: Card[],
  categories: Category[],
  states: Record<string, CardState>,
  colourMeanings: ColourMeaning[],
): string {
  /**
   * v1 requires every card to sit in a category; v2 allows unsorted. So cards
   * you have not judged are put in the first category rather than dropped,
   * because losing the card entirely would be the worse outcome.
   */
  const fallbackCategory = categories[0]?.id ?? 'category-dont-know'

  const exported: ExportedCard[] = cards.map((card) => ({
    id: card.id,
    english: card.english,
    portuguese: card.portuguese,
    categoryId: states[card.id]?.categoryId ?? fallbackCategory,
    createdAt: card.createdAt,
    updatedAt: card.updatedAt,
  }))

  const file = {
    app: 'portuguese-flashcards',
    exportedAt: new Date().toISOString(),
    schemaVersion: 2,
    cards: exported,
    categories: categories.map((category) => ({
      id: category.id,
      name: category.name,
      order: category.sortOrder,
      createdAt: '',
      updatedAt: '',
    })),
    colourMeanings,
    deletions: [],
  }

  return JSON.stringify(file, null, 2)
}

export function downloadBackup(
  cards: Card[],
  categories: Category[],
  states: Record<string, CardState>,
  colourMeanings: ColourMeaning[],
): void {
  const blob = new Blob([toBackupJson(cards, categories, states, colourMeanings)], {
    type: 'application/json',
  })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = backupFilename()
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}
