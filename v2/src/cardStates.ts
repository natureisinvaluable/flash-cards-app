import type { CardState } from './types'
import { supabase } from './supabase'

/**
 * What you think of each card: which of your categories it sits in, and when
 * you last saw it.
 *
 * One row per person per card. The database restricts every read and write
 * here to your own rows, so two people filing the same card differently never
 * touch each other's data.
 */

interface CardStateRow {
  card_id: string
  category_id: string | null
  last_viewed_at: string | null
}

export async function fetchCardStates(): Promise<Record<string, CardState>> {
  const { data, error } = await supabase
    .from('card_states')
    .select('card_id, category_id, last_viewed_at')
  if (error) throw new Error(error.message)

  const states: Record<string, CardState> = {}
  for (const row of data as CardStateRow[]) {
    states[row.card_id] = {
      cardId: row.card_id,
      categoryId: row.category_id,
      lastViewedAt: row.last_viewed_at,
    }
  }
  return states
}

/**
 * File a card into one of your categories, or into nothing.
 *
 * Upsert rather than insert-or-update: the row may not exist yet, because a
 * card you have never judged has no state at all.
 */
export async function setCardCategory(
  userId: string,
  cardId: string,
  categoryId: string | null,
): Promise<void> {
  const { error } = await supabase
    .from('card_states')
    .upsert({ user_id: userId, card_id: cardId, category_id: categoryId }, { onConflict: 'user_id,card_id' })
  if (error) throw new Error(error.message)
}
