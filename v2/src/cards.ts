import type { Card, CardSide, ColourSpan } from './types'
import { newId } from './ids'
import { supabase } from './supabase'

/**
 * Reading the shared pool of cards.
 *
 * Everything that touches the `cards` table goes through here, the same way v1
 * funnelled every read and write through one storage module.
 *
 * The database stores each side as two columns - the text and its colour
 * ranges - because that is the natural shape for a database. The app works
 * with a tidier `CardSide` object. The translation between them lives here and
 * nowhere else.
 */

interface CardRow {
  id: string
  english_text: string
  english_spans: unknown
  portuguese_text: string
  portuguese_spans: unknown
  created_by: string | null
  created_at: string
  updated_at: string
}

/**
 * Spans come back from the database as free-form JSON, so they are checked
 * rather than trusted. A malformed span would otherwise paint colour onto the
 * wrong letters, which teaches the wrong thing - the failure v1 was careful to
 * avoid throughout.
 */
function toSide(text: string, rawSpans: unknown): CardSide {
  const spans: ColourSpan[] = Array.isArray(rawSpans)
    ? rawSpans.filter(
        (s): s is ColourSpan =>
          typeof s === 'object' &&
          s !== null &&
          typeof (s as ColourSpan).start === 'number' &&
          typeof (s as ColourSpan).end === 'number' &&
          typeof (s as ColourSpan).colour === 'string',
      )
    : []
  return { text, spans }
}

function toCard(row: CardRow): Card {
  return {
    id: row.id,
    english: toSide(row.english_text, row.english_spans),
    portuguese: toSide(row.portuguese_text, row.portuguese_spans),
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function fetchCards(): Promise<Card[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('id, english_text, english_spans, portuguese_text, portuguese_spans, created_by, created_at, updated_at')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data as CardRow[]).map(toCard)
}

/**
 * Add a card to the shared pool.
 *
 * The card belongs to everyone immediately - there is no private draft state.
 * `created_by` records who added it, which the database also insists matches
 * the person making the request.
 */
export async function createCard(
  userId: string,
  english: CardSide,
  portuguese: CardSide,
): Promise<Card> {
  const { data, error } = await supabase
    .from('cards')
    .insert({
      id: newId(),
      english_text: english.text,
      english_spans: english.spans,
      portuguese_text: portuguese.text,
      portuguese_spans: portuguese.spans,
      created_by: userId,
    })
    .select('id, english_text, english_spans, portuguese_text, portuguese_spans, created_by, created_at, updated_at')
    .single()

  if (error) throw new Error(error.message)
  return toCard(data as CardRow)
}

/**
 * Correct a card.
 *
 * Anyone signed in may do this, and the change is seen by everyone. That is
 * deliberate - a shared pool with a shared spelling mistake in it helps nobody
 * - but it does mean an edit is not a private act, and the editor says so.
 */
export async function updateCard(
  cardId: string,
  english: CardSide,
  portuguese: CardSide,
): Promise<Card> {
  const { data, error } = await supabase
    .from('cards')
    .update({
      english_text: english.text,
      english_spans: english.spans,
      portuguese_text: portuguese.text,
      portuguese_spans: portuguese.spans,
    })
    .eq('id', cardId)
    .select('id, english_text, english_spans, portuguese_text, portuguese_spans, created_by, created_at, updated_at')
    .single()

  if (error) throw new Error(error.message)
  return toCard(data as CardRow)
}

/**
 * Remove a card from the shared pool. Owner only.
 *
 * The database refuses this for anyone else - but refusing a delete does NOT
 * produce an error. Row level security filters rows rather than rejecting the
 * statement, so a non-owner's delete quietly matches nothing and reports
 * success. Taking that at face value would remove the card from their screen
 * and leave it in the database, to reappear on the next reload.
 *
 * So the deleted rows are asked for back, and an empty result is treated as
 * the refusal it actually is.
 */
export async function deleteCard(cardId: string): Promise<void> {
  const { data, error } = await supabase.from('cards').delete().eq('id', cardId).select('id')

  if (error) throw new Error(error.message)
  if (!data || data.length === 0) {
    throw new Error('The database would not delete that card. Only the owner can delete cards.')
  }
}
