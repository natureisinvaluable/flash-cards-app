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
 * Write your view of a card. BOTH fields are always sent.
 *
 * The row may not exist yet - a card you have never judged has no state at all
 * - so this is an upsert. Sending only the field being changed would risk the
 * other being wiped, which during a study session would mean quietly unfiling
 * every card as you looked at it. Passing both costs nothing and removes the
 * possibility.
 */
export async function upsertCardState(
  userId: string,
  cardId: string,
  state: { categoryId: string | null; lastViewedAt: string | null },
): Promise<void> {
  const { error } = await supabase.from('card_states').upsert(
    {
      user_id: userId,
      card_id: cardId,
      category_id: state.categoryId,
      last_viewed_at: state.lastViewedAt,
    },
    { onConflict: 'user_id,card_id' },
  )
  if (error) throw new Error(error.message)
}
