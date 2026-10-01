import type { CardSide, ColourSpan } from './types'

/**
 * Reading a v1 backup file.
 *
 * Checked rather than trusted, in the same spirit as v1's own restore: this
 * writes into a pool that several people share, so a malformed file must be
 * refused before it touches anything rather than half-applied.
 */

export interface ImportedCard {
  id: string
  english: CardSide
  portuguese: CardSide
  /** The category id used inside the FILE, not in v2. */
  fileCategoryId: string
  createdAt: string
}

export interface ImportedFile {
  cards: ImportedCard[]
  /** Category names from the file, keyed by the file's own id. */
  categoryNames: Record<string, string>
}

export type ParseResult =
  | { ok: true; file: ImportedFile; warning?: string }
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
      typeof (s as ColourSpan).start === 'number' &&
      typeof (s as ColourSpan).end === 'number' &&
      typeof (s as ColourSpan).colour === 'string',
  )
}

export function parseBackupFile(text: string): ParseResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    return {
      ok: false,
      error: "That file isn't readable. Make sure you picked the .json file the app created.",
    }
  }

  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: "That file doesn't contain any flashcard data." }
  }

  const file = parsed as { app?: unknown; cards?: unknown; categories?: unknown }

  if (file.app !== undefined && file.app !== 'portuguese-flashcards') {
    return { ok: false, error: 'That backup was made by a different app.' }
  }
  if (!Array.isArray(file.cards) || !Array.isArray(file.categories)) {
    return {
      ok: false,
      error: "That file doesn't look like a flashcards backup — it has no cards or categories in it.",
    }
  }

  const categoryNames: Record<string, string> = {}
  for (const raw of file.categories) {
    if (typeof raw === 'object' && raw !== null) {
      const category = raw as { id?: unknown; name?: unknown }
      if (typeof category.id === 'string' && typeof category.name === 'string') {
        categoryNames[category.id] = category.name
      }
    }
  }

  const cards: ImportedCard[] = []
  for (const raw of file.cards) {
    if (typeof raw !== 'object' || raw === null) continue
    const card = raw as Record<string, unknown>
    if (typeof card.id !== 'string') continue
    if (!isSide(card.english) || !isSide(card.portuguese)) continue
    if (!card.english.text.trim() || !card.portuguese.text.trim()) continue

    cards.push({
      id: card.id,
      english: card.english,
      portuguese: card.portuguese,
      fileCategoryId: typeof card.categoryId === 'string' ? card.categoryId : '',
      createdAt: typeof card.createdAt === 'string' ? card.createdAt : new Date().toISOString(),
    })
  }

  if (cards.length === 0) {
    return { ok: false, error: 'That file has no usable cards in it.' }
  }

  const skipped = file.cards.length - cards.length
  return {
    ok: true,
    file: { cards, categoryNames },
    warning:
      skipped > 0
        ? `${skipped} ${skipped === 1 ? 'card was' : 'cards were'} unreadable and will be skipped`
        : undefined,
  }
}
