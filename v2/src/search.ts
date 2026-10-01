import type { Card } from './types'

/**
 * Searching ignores case AND accents, so typing `cao` finds `o cão` and
 * `dificil` finds `difícil`.
 *
 * This matters more here than in most apps: the accented characters are
 * precisely the ones that are awkward to type, and needing the exact accent to
 * find a word would make search useless for exactly the words hardest to
 * remember.
 *
 * Works because searching runs against plain text. An HTML-based editor would
 * have made this much harder - see the colour rule in CLAUDE.md.
 */
export function normalise(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
}

/** Does this card match the search term, on either side? */
export function cardMatches(card: Card, term: string): boolean {
  const needle = normalise(term)
  if (needle.length === 0) return true
  return (
    normalise(card.english.text).includes(needle) ||
    normalise(card.portuguese.text).includes(needle)
  )
}
