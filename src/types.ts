/**
 * The shape of everything the app stores.
 *
 * Two rules from CLAUDE.md are visible here and should be preserved:
 *
 * 1. Card text is stored as PLAIN TEXT. Colours live separately as ranges
 *    ("characters 4 to 8 are blue"). No HTML is ever stored. This keeps search
 *    simple and correct, and avoids a rich-text editor dependency.
 *
 * 2. Every record carries a stable `id` and an `updatedAt` timestamp. Nothing
 *    uses them yet. They exist so that syncing to a second device later is a
 *    contained change rather than a rewrite.
 */

/** The six card colours. Their *meanings* are editable data, see ColourMeaning. */
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

export interface Card {
  id: string
  english: CardSide
  portuguese: CardSide
  categoryId: string
  createdAt: string
  updatedAt: string
  /** Seed cards shipped with the app, so they can be removed in one action. */
  isExample?: boolean
}

/** A confidence bucket. The owner can rename these and add more. */
export interface Category {
  id: string
  name: string
  /** Lower numbers sort first. */
  order: number
  createdAt: string
  updatedAt: string
}

/** What a colour means to the owner, e.g. blue = "Masculine noun". Editable. */
export interface ColourMeaning {
  colour: ColourId
  label: string
  /** Absent on data saved before merging existed; treated as "very old". */
  updatedAt?: string
}

/**
 * A record that something was deleted, kept after the thing itself is gone.
 *
 * Without this, merging two devices would resurrect deleted cards: the other
 * device still has the card, sees no reason to think it was removed on
 * purpose, and hands it back. Knowing WHEN it was deleted lets a later edit on
 * another device legitimately win instead.
 */
export interface Deletion {
  id: string
  deletedAt: string
}

/** Everything the app stores, as one document. */
export interface AppData {
  schemaVersion: number
  cards: Card[]
  categories: Category[]
  colourMeanings: ColourMeaning[]
  /** Ids of cards and categories that were deliberately removed. */
  deletions: Deletion[]
}
