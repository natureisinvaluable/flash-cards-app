import type { Category } from './types'
import type { ImportedFile } from './importBackup'
import { supabase } from './supabase'

/**
 * Writing an imported file into the shared pool.
 *
 * Two separate things happen, and keeping them separate is the point:
 *
 *  - The CARDS go into the pool everyone shares.
 *  - The FILING goes only into the importer's own rows. Nobody else inherits
 *    an opinion about how well these cards are known; they see them as new.
 *
 * Everything is an upsert keyed on the card's own id, so running the same
 * import twice updates rather than duplicates.
 */

const BATCH = 100

export interface ImportPlan {
  total: number
  alreadyPresent: number
  brandNew: number
  /** File category name -> the v2 category it will map to, or null. */
  mapping: { name: string; to: Category | null; cards: number }[]
  unmapped: number
}

/** Match the file's categories to yours by name, ignoring case and spacing. */
export function planImport(
  file: ImportedFile,
  existingCardIds: Set<string>,
  categories: Category[],
): ImportPlan {
  const normalise = (s: string) => s.trim().toLowerCase()
  const byName = new Map(categories.map((c) => [normalise(c.name), c]))

  const counts = new Map<string, number>()
  for (const card of file.cards) {
    const name = file.categoryNames[card.fileCategoryId] ?? ''
    counts.set(name, (counts.get(name) ?? 0) + 1)
  }

  const mapping = [...counts.entries()].map(([name, cards]) => ({
    name: name || '(none)',
    to: byName.get(normalise(name)) ?? null,
    cards,
  }))

  return {
    total: file.cards.length,
    alreadyPresent: file.cards.filter((c) => existingCardIds.has(c.id)).length,
    brandNew: file.cards.filter((c) => !existingCardIds.has(c.id)).length,
    mapping,
    unmapped: mapping.filter((m) => m.to === null).reduce((sum, m) => sum + m.cards, 0),
  }
}

export async function runImport(
  userId: string,
  file: ImportedFile,
  categories: Category[],
  onProgress: (done: number, total: number) => void,
): Promise<void> {
  const normalise = (s: string) => s.trim().toLowerCase()
  const byName = new Map(categories.map((c) => [normalise(c.name), c]))

  const cardRows = file.cards.map((card) => ({
    id: card.id,
    english_text: card.english.text,
    english_spans: card.english.spans,
    portuguese_text: card.portuguese.text,
    portuguese_spans: card.portuguese.spans,
    created_by: userId,
    created_at: card.createdAt,
  }))

  for (let i = 0; i < cardRows.length; i += BATCH) {
    const { error } = await supabase
      .from('cards')
      .upsert(cardRows.slice(i, i + BATCH), { onConflict: 'id' })
    if (error) throw new Error(`While adding cards: ${error.message}`)
    onProgress(Math.min(i + BATCH, cardRows.length), cardRows.length * 2)
  }

  // Your own filing. Cards whose category does not match one of yours are
  // left out entirely, which leaves them unsorted rather than guessing.
  const stateRows = file.cards
    .map((card) => {
      const name = file.categoryNames[card.fileCategoryId] ?? ''
      const category = byName.get(normalise(name))
      return category
        ? { user_id: userId, card_id: card.id, category_id: category.id }
        : null
    })
    .filter((row): row is { user_id: string; card_id: string; category_id: string } => row !== null)

  for (let i = 0; i < stateRows.length; i += BATCH) {
    const { error } = await supabase
      .from('card_states')
      .upsert(stateRows.slice(i, i + BATCH), { onConflict: 'user_id,card_id' })
    if (error) throw new Error(`While filing the cards: ${error.message}`)
    onProgress(cardRows.length + Math.min(i + BATCH, stateRows.length), cardRows.length * 2)
  }
}
