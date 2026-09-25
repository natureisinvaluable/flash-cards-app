/**
 * Builds a starter deck as a backup file, which the app can then MERGE into
 * whatever cards are already on a device.
 *
 * Run with:  npx tsx scripts/build-starter-deck.ts
 *
 * Two safety properties worth preserving if you extend this:
 *
 * 1. Colour positions are FOUND, never hand-counted. Naming the phrase to
 *    colour and letting indexOf locate it means a colour can never silently
 *    land on the wrong letters.
 * 2. A phrase that is not found, or found more than once, throws. A silent
 *    miss would produce a card that looks right but teaches nothing.
 *
 * All vocabulary is EUROPEAN Portuguese. See CLAUDE.md.
 */

import { writeFileSync } from 'node:fs'
import type { Card, CardSide, Category, ColourId, ColourMeaning } from '../src/types'

/* ------------------------------------------------------------------ helpers */

type Highlight = [phrase: string, colour: ColourId]

interface Entry {
  id: string
  english: string
  portuguese: string
  highlights?: Highlight[]
}

function side(text: string, highlights: Highlight[] = []): CardSide {
  return {
    text,
    spans: highlights.map(([phrase, colour]) => {
      const start = text.indexOf(phrase)
      if (start === -1) {
        throw new Error(`"${phrase}" does not appear in "${text}"`)
      }
      if (text.indexOf(phrase, start + 1) !== -1) {
        throw new Error(`"${phrase}" appears more than once in "${text}" - be more specific`)
      }
      return { start, end: start + phrase.length, colour }
    }),
  }
}

/* -------------------------------------------------------------------- verbs */

interface VerbForms {
  /** eu, tu, ele, nós, eles */
  present: [string, string, string, string, string]
  past: [string, string, string, string, string]
  imperfect: [string, string, string, string, string]
}

interface Verb {
  slug: string
  english: string
  forms: VerbForms
  /** Forms worth marking, per tense. */
  highlights?: Partial<Record<keyof VerbForms, Highlight[]>>
}

const PRONOUNS = ['eu', 'tu', 'ele', 'nós', 'eles'] as const

const VERBS: Verb[] = [
  {
    slug: 'ser',
    english: 'to be (permanent)',
    forms: {
      present: ['sou', 'és', 'é', 'somos', 'são'],
      past: ['fui', 'foste', 'foi', 'fomos', 'foram'],
      imperfect: ['era', 'eras', 'era', 'éramos', 'eram'],
    },
    highlights: { imperfect: [['é', 'purple']] },
  },
  {
    slug: 'estar',
    english: 'to be (right now, or in a place)',
    forms: {
      present: ['estou', 'estás', 'está', 'estamos', 'estão'],
      past: ['estive', 'estiveste', 'esteve', 'estivemos', 'estiveram'],
      imperfect: ['estava', 'estavas', 'estava', 'estávamos', 'estavam'],
    },
    highlights: { imperfect: [['tá', 'purple']] },
  },
  {
    slug: 'ter',
    english: 'to have',
    forms: {
      present: ['tenho', 'tens', 'tem', 'temos', 'têm'],
      past: ['tive', 'tiveste', 'teve', 'tivemos', 'tiveram'],
      imperfect: ['tinha', 'tinhas', 'tinha', 'tínhamos', 'tinham'],
    },
    highlights: {
      // têm vs tem is one of the classic written-accent traps.
      present: [['têm', 'orange']],
      imperfect: [['tí', 'purple']],
    },
  },
  {
    slug: 'ir',
    english: 'to go',
    forms: {
      present: ['vou', 'vais', 'vai', 'vamos', 'vão'],
      past: ['fui', 'foste', 'foi', 'fomos', 'foram'],
      imperfect: ['ia', 'ias', 'ia', 'íamos', 'iam'],
    },
    highlights: { imperfect: [['í', 'purple']] },
  },
  {
    slug: 'fazer',
    english: 'to do, to make',
    forms: {
      present: ['faço', 'fazes', 'faz', 'fazemos', 'fazem'],
      past: ['fiz', 'fizeste', 'fez', 'fizemos', 'fizeram'],
      imperfect: ['fazia', 'fazias', 'fazia', 'fazíamos', 'faziam'],
    },
    highlights: { imperfect: [['zí', 'purple']] },
  },
  {
    slug: 'poder',
    english: 'to be able to, can',
    forms: {
      present: ['posso', 'podes', 'pode', 'podemos', 'podem'],
      past: ['pude', 'pudeste', 'pôde', 'pudemos', 'puderam'],
      imperfect: ['podia', 'podias', 'podia', 'podíamos', 'podiam'],
    },
    highlights: {
      // pôde (past) against pode (present) - same trap as têm.
      past: [['pôde', 'orange']],
      imperfect: [['dí', 'purple']],
    },
  },
  {
    slug: 'querer',
    english: 'to want',
    forms: {
      present: ['quero', 'queres', 'quer', 'queremos', 'querem'],
      past: ['quis', 'quiseste', 'quis', 'quisemos', 'quiseram'],
      imperfect: ['queria', 'querias', 'queria', 'queríamos', 'queriam'],
    },
    highlights: { imperfect: [['rí', 'purple']] },
  },
  {
    slug: 'saber',
    english: 'to know (a fact)',
    forms: {
      present: ['sei', 'sabes', 'sabe', 'sabemos', 'sabem'],
      past: ['soube', 'soubeste', 'soube', 'soubemos', 'souberam'],
      imperfect: ['sabia', 'sabias', 'sabia', 'sabíamos', 'sabiam'],
    },
    highlights: { imperfect: [['bí', 'purple']] },
  },
]

const TENSE_LABELS: Record<keyof VerbForms, string> = {
  present: 'present',
  past: 'past, finished',
  imperfect: 'past, used to / was doing',
}

function conjugation(forms: string[]): string {
  return PRONOUNS.map((pronoun, i) => `${pronoun} ${forms[i]}`).join('\n')
}

function verbEntries(): Entry[] {
  const entries: Entry[] = []
  for (const verb of VERBS) {
    for (const tense of ['present', 'past', 'imperfect'] as const) {
      entries.push({
        id: `starter-${verb.slug}-${tense}`,
        english: `${verb.english}\n— ${TENSE_LABELS[tense]}`,
        portuguese: conjugation(verb.forms[tense]),
        highlights: verb.highlights?.[tense],
      })
    }
  }
  return entries
}

/* ----------------------------------------------------- everything else (26) */

/** Nouns carry their article so the gender is learned with the word. */
const NOUNS: [portuguese: string, english: string, gender: 'blue' | 'pink'][] = [
  ['o emprego', 'the job', 'blue'],
  ['o dinheiro', 'the money', 'blue'],
  ['a saúde', 'health', 'pink'],
  ['o autocarro', 'the bus', 'blue'],
  ['a paragem', 'the bus stop', 'pink'],
  ['o telemóvel', 'the mobile phone', 'blue'],
  ['a morada', 'the address', 'pink'],
  ['o frigorífico', 'the fridge', 'blue'],
  ['a sandes', 'the sandwich', 'pink'],
  ['o sumo', 'the juice', 'blue'],
  ['o talho', "the butcher's", 'blue'],
  ['a esferográfica', 'the biro, the pen', 'pink'],
]

const OTHERS: [portuguese: string, english: string][] = [
  ['barato', 'cheap'],
  ['caro', 'expensive'],
  ['cansado', 'tired'],
  ['cheio', 'full'],
  ['vazio', 'empty'],
  ['molhado', 'wet'],
  ['seco', 'dry'],
  ['talvez', 'maybe, perhaps'],
  ['ainda', 'still, yet'],
  ['quase', 'almost'],
  ['de vez em quando', 'from time to time'],
  ['apesar de', 'in spite of, despite'],
  ['cedo', 'early'],
  ['perto de', 'near, close to'],
]

function slug(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function wordEntries(): Entry[] {
  return [
    ...NOUNS.map(([portuguese, english, gender]) => ({
      id: `starter-${slug(portuguese)}`,
      english,
      portuguese,
      highlights: [[portuguese, gender]] as Highlight[],
    })),
    ...OTHERS.map(([portuguese, english]) => ({
      id: `starter-${slug(portuguese)}`,
      english,
      portuguese,
    })),
  ]
}

/* ------------------------------------------------------------------- output */

const GENERATED_AT = '2026-09-25T12:00:00.000Z'

/**
 * Categories are dated far in the past on purpose. Merging keeps whichever
 * version was edited most recently, so an old date means the names already on
 * the device always win - a rename of "Don't know" survives this import.
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

const entries = [...verbEntries(), ...wordEntries()]

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
  createdAt: GENERATED_AT,
  updatedAt: GENERATED_AT,
}))

const file = {
  app: 'portuguese-flashcards',
  exportedAt: GENERATED_AT,
  schemaVersion: 2,
  cards,
  categories: CATEGORIES,
  colourMeanings: COLOUR_MEANINGS,
  deletions: [],
}

const path = 'starter-decks/starter-50.json'
writeFileSync(path, JSON.stringify(file, null, 2) + '\n')

console.log(`Wrote ${path}`)
console.log(`  ${cards.length} cards: ${verbEntries().length} verb, ${wordEntries().length} other`)
console.log(`  ${cards.filter((c) => c.portuguese.spans.length > 0).length} carry colour`)
