import type { AppData, Card, CardSide, Category, ColourMeaning } from './types'
import { SCHEMA_VERSION, defaultColourMeanings } from './exampleData'

/**
 * Saving a copy of everything to a file, and reading one back.
 *
 * With no server, this is the only protection against losing every card:
 * clearing site data, resetting the device or switching browser all wipe the
 * app's storage with nothing to recover from. So this code errs firmly towards
 * being cautious and explaining itself rather than being clever.
 */

/** What a backup file contains. Deliberately close to AppData plus a header. */
interface BackupFile extends AppData {
  app: 'portuguese-flashcards'
  exportedAt: string
}

export function backupFilename(date = new Date()): string {
  const stamp = date.toISOString().slice(0, 10)
  return `portuguese-flashcards-backup-${stamp}.json`
}

export function toBackupJson(data: AppData): string {
  const file: BackupFile = {
    app: 'portuguese-flashcards',
    exportedAt: new Date().toISOString(),
    ...data,
  }
  return JSON.stringify(file, null, 2)
}

/** Prompt the browser to save the backup to the user's downloads. */
export function downloadBackup(data: AppData): void {
  const blob = new Blob([toBackupJson(data)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = backupFilename()
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export type ParseResult =
  | { ok: true; data: AppData; warning?: string }
  | { ok: false; error: string }

function isSide(value: unknown): value is CardSide {
  if (typeof value !== 'object' || value === null) return false
  const side = value as Partial<CardSide>
  if (typeof side.text !== 'string') return false
  if (!Array.isArray(side.spans)) return false
  return side.spans.every(
    (s) =>
      typeof s === 'object' &&
      s !== null &&
      typeof (s as { start: unknown }).start === 'number' &&
      typeof (s as { end: unknown }).end === 'number' &&
      typeof (s as { colour: unknown }).colour === 'string',
  )
}

function isCard(value: unknown): value is Card {
  if (typeof value !== 'object' || value === null) return false
  const card = value as Partial<Card>
  return (
    typeof card.id === 'string' &&
    typeof card.categoryId === 'string' &&
    isSide(card.english) &&
    isSide(card.portuguese)
  )
}

function isCategory(value: unknown): value is Category {
  if (typeof value !== 'object' || value === null) return false
  const category = value as Partial<Category>
  return typeof category.id === 'string' && typeof category.name === 'string'
}

/**
 * Check a chosen file really is a backup from this app before letting it
 * replace anything. Every failure returns wording aimed at the person, not a
 * developer.
 */
export function parseBackup(text: string): ParseResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return {
      ok: false,
      error: "That file isn't readable as a backup. Make sure you picked the .json file this app created.",
    }
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: "That file doesn't contain any flashcard data." }
  }

  const file = parsed as Partial<BackupFile>

  if (file.app !== undefined && file.app !== 'portuguese-flashcards') {
    return { ok: false, error: 'That backup was made by a different app.' }
  }

  if (!Array.isArray(file.cards) || !Array.isArray(file.categories)) {
    return {
      ok: false,
      error: "That file doesn't look like a flashcards backup — it has no cards or categories in it.",
    }
  }

  const cards = file.cards.filter(isCard)
  const categories = file.categories.filter(isCategory)

  if (categories.length === 0) {
    return { ok: false, error: 'That backup has no categories in it, so the cards would have nowhere to go.' }
  }

  // Cards pointing at a category the backup doesn't contain would vanish from
  // every list. Move them to the first category instead of dropping them.
  const known = new Set(categories.map((c) => c.id))
  const rehomed = cards.map((card) =>
    known.has(card.categoryId) ? card : { ...card, categoryId: categories[0].id },
  )

  const notes: string[] = []
  const skipped = file.cards.length - cards.length
  if (skipped > 0) {
    notes.push(`${skipped} damaged ${skipped === 1 ? 'card was' : 'cards were'} skipped`)
  }
  const moved = rehomed.filter((c, i) => c.categoryId !== cards[i].categoryId).length
  if (moved > 0) {
    notes.push(`${moved} ${moved === 1 ? 'card' : 'cards'} had a missing category and moved to "${categories[0].name}"`)
  }
  if (typeof file.schemaVersion === 'number' && file.schemaVersion > SCHEMA_VERSION) {
    notes.push('this backup came from a newer version of the app, so something may be missing')
  }

  const colourMeanings: ColourMeaning[] = Array.isArray(file.colourMeanings)
    ? (file.colourMeanings as ColourMeaning[])
    : defaultColourMeanings()

  return {
    ok: true,
    data: {
      schemaVersion: SCHEMA_VERSION,
      cards: rehomed,
      categories,
      colourMeanings,
    },
    warning: notes.length > 0 ? notes.join('; ') : undefined,
  }
}
