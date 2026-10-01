import type { Card, CardState } from './types'
import { shuffle } from './shuffle'

export type Order = 'shuffled' | 'least-recent' | 'most-recent'

export const ORDER_LABELS: Record<Order, string> = {
  shuffled: 'Shuffled',
  'least-recent': 'Least recently seen first',
  'most-recent': 'Most recently seen first',
}

/**
 * Put a study deck in order.
 *
 * A card you have never seen counts as the MOST overdue, so it sorts ahead of
 * every card with a real date. The alternative - treating "never" as "not due"
 * - would bury new cards at the back and quietly stop you ever meeting them.
 *
 * Cards never seen are shuffled among themselves rather than left in whatever
 * order the database returned, so a long tail of new cards is not always met
 * in the same sequence.
 */
export function arrangeCards(
  cards: Card[],
  states: Record<string, CardState>,
  order: Order,
): Card[] {
  if (order === 'shuffled') return shuffle(cards)

  const seenAt = (card: Card) => states[card.id]?.lastViewedAt ?? null

  const neverSeen = shuffle(cards.filter((card) => seenAt(card) === null))
  const seen = cards
    .filter((card) => seenAt(card) !== null)
    .sort((a, b) => (seenAt(a)! < seenAt(b)! ? -1 : seenAt(a)! > seenAt(b)! ? 1 : 0))

  return order === 'least-recent'
    ? [...neverSeen, ...seen]
    : [...seen.reverse(), ...neverSeen]
}
