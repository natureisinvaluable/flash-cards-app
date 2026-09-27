/**
 * The shape of a card in v2.
 *
 * Carried over from v1 unchanged in one important respect: card text is stored
 * as PLAIN TEXT, with colours held separately as ranges ("characters 4 to 8
 * are blue"). No HTML is ever stored. That keeps search simple and avoids a
 * rich-text editor dependency. See v2/CLAUDE.md.
 *
 * What is new is that a Card carries no category. In v2 a card belongs to
 * everyone, and what any one person thinks of it lives separately - see
 * CardState, which arrives with categories in the next stage.
 */

export type ColourId = 'blue' | 'pink' | 'green' | 'orange' | 'purple' | 'teal'

export const COLOUR_IDS: ColourId[] = ['blue', 'pink', 'green', 'orange', 'purple', 'teal']

/** A stretch of coloured text: characters [start, end) of the side's text. */
export interface ColourSpan {
  start: number
  end: number
  colour: ColourId
}

/** One face of a card: the words, plus any colouring applied to them. */
export interface CardSide {
  text: string
  spans: ColourSpan[]
}

/** A card in the shared pool. */
export interface Card {
  id: string
  english: CardSide
  portuguese: CardSide
  createdBy: string | null
  createdAt: string
  updatedAt: string
}
