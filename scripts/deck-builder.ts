/**
 * Shared machinery for building deck files.
 *
 * A deck is written out as a BACKUP file, so the app can merge it into
 * whatever is already on a device rather than needing to reach into browser
 * storage.
 *
 * Two safety properties worth preserving:
 *
 * 1. Colour positions are FOUND, never hand-counted. Naming the phrase to
 *    colour and letting indexOf locate it means a colour can never silently
 *    land on the wrong letters.
 * 2. A phrase that is missing, or that appears more than once, throws. A silent
 *    miss would produce a card that looks right and teaches nothing.
 *
 * All vocabulary must be EUROPEAN Portuguese. See CLAUDE.md.
 */

import { writeFileSync } from 'node:fs'
import type { Card, CardSide, Category, ColourId, ColourMeaning } from '../src/types'

export type Highlight = [phrase: string, colour: ColourId]

export interface Entry {
  id: string
  english: string
  portuguese: string
  highlights?: Highlight[]
}

export function side(text: string, highlights: Highlight[] = []): CardSide {
  return {
    text,
    spans: highlights.map(([phrase, colour]) => {
      const start = text.indexOf(phrase)
      if (start === -1) {
        throw new Error(`"${phrase}" does not appear in "${text.replace(/\n/g, ' / ')}"`)
      }
      if (text.indexOf(phrase, start + 1) !== -1) {
        throw new Error(
          `"${phrase}" appears more than once in "${text.replace(/\n/g, ' / ')}" - be more specific`,
        )
      }
      return { start, end: start + phrase.length, colour }
    }),
  }
}

/* -------------------------------------------------------------------- verbs */

export interface VerbForms {
  /** eu, tu, ele, nós, eles */
  present: [string, string, string, string, string]
  past: [string, string, string, string, string]
  imperfect: [string, string, string, string, string]
}

export interface Verb {
  slug: string
  english: string
  forms: VerbForms
  /** Forms worth marking, per tense. Keep these sparse. */
  highlights?: Partial<Record<keyof VerbForms, Highlight[]>>
}

const PRONOUNS = ['eu', 'tu', 'ele', 'nós', 'eles'] as const

const TENSE_LABELS: Record<keyof VerbForms, string> = {
  present: 'present',
  past: 'past, finished',
  imperfect: 'past, used to / was doing',
}

export function verbEntries(verbs: Verb[]): Entry[] {
  const entries: Entry[] = []
  for (const verb of verbs) {
    for (const tense of ['present', 'past', 'imperfect'] as const) {
      entries.push({
        id: `starter-${verb.slug}-${tense}`,
        english: `${verb.english}\n— ${TENSE_LABELS[tense]}`,
        portuguese: PRONOUNS.map((pronoun, i) => `${pronoun} ${verb.forms[tense][i]}`).join('\n'),
        highlights: verb.highlights?.[tense],
      })
    }
  }
  return entries
}

/* ------------------------------------------------------------- other words */

export type Noun = [portuguese: string, english: string, gender: 'blue' | 'pink']
export type Word = [portuguese: string, english: string]

function slug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Nouns carry their article, so the gender is learned with the word. */
export function nounEntries(nouns: Noun[]): Entry[] {
  return nouns.map(([portuguese, english, gender]) => ({
    id: `starter-${slug(portuguese)}`,
    english,
    portuguese,
    highlights: [[portuguese, gender]] as Highlight[],
  }))
}

/** Adjectives, adverbs and phrases. Deliberately uncoloured. */
export function wordEntries(words: Word[]): Entry[] {
  return words.map(([portuguese, english]) => ({
    id: `starter-${slug(portuguese)}`,
    english,
    portuguese,
  }))
}

/* ------------------------------------------------------------------- output */

/**
 * Categories are dated far in the past on purpose. Merging keeps whichever
 * version was edited most recently, so an old date means the names already on
 * the device always win - a renamed "Don't know" survives an import.
 */
const LONG_AGO = '2020-01-01T00:00:00.000Z'

const CATEGORIES: Category[] = [
  { id: 'category-dont-know', name: "Don't know", order: 0, createdAt: LONG_AGO, updatedAt: LONG_AGO },
  { id: 'category-know-a-little', name: 'Know a little', order: 1, createdAt: LONG_AGO, updatedAt: LONG_AGO },
  { id: 'category-know-well', name: 'Know well', order: 2, createdAt: LONG_AGO, updatedAt: LONG_AGO },
]

/** No updatedAt, so any label already on the device wins. */
const COLOUR_MEANINGS: ColourMeaning[] = [
  { colour: 'blue', label: 'Masculine noun' },
  { colour: 'pink', label: 'Feminine noun' },
  { colour: 'green', label: 'Verb ending' },
  { colour: 'orange', label: 'Irregular' },
  { colour: 'purple', label: 'Stressed syllable' },
  { colour: 'teal', label: 'Your own use' },
]

export function writeDeck(path: string, entries: Entry[], generatedAt: string): void {
  const ids = new Set(entries.map((e) => e.id))
  if (ids.size !== entries.length) {
    throw new Error('Two entries share an id, which would make them collide on merge')
  }

  const cards: Card[] = entries.map((entry) => ({
    id: entry.id,
    english: side(entry.english),
    portuguese: side(entry.portuguese, entry.highlights),
    // Everything starts unknown, so each card gets judged on its way past.
    categoryId: 'category-dont-know',
    createdAt: generatedAt,
    updatedAt: generatedAt,
  }))

  const file = {
    app: 'portuguese-flashcards',
    exportedAt: generatedAt,
    schemaVersion: 2,
    cards,
    categories: CATEGORIES,
    colourMeanings: COLOUR_MEANINGS,
    deletions: [],
  }

  writeFileSync(path, JSON.stringify(file, null, 2) + '\n')

  const coloured = cards.filter((c) => c.portuguese.spans.length > 0).length
  console.log(`Wrote ${path}`)
  console.log(`  ${cards.length} cards, ${coloured} carrying colour`)
}
