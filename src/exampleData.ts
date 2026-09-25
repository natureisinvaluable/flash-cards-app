import type { AppData, Card, CardSide, Category, ColourId, ColourMeaning } from './types'

/**
 * Seed content, shown the first time the app is opened.
 *
 * All vocabulary here is EUROPEAN Portuguese, not Brazilian. See CLAUDE.md.
 * Each example demonstrates one of the six colours so the system explains
 * itself without needing instructions.
 */

export const SCHEMA_VERSION = 2

export const CATEGORY_IDS = {
  dontKnow: 'category-dont-know',
  knowALittle: 'category-know-a-little',
  knowWell: 'category-know-well',
} as const

export function defaultCategories(now: string): Category[] {
  return [
    { id: CATEGORY_IDS.dontKnow, name: "Don't know", order: 0, createdAt: now, updatedAt: now },
    { id: CATEGORY_IDS.knowALittle, name: 'Know a little', order: 1, createdAt: now, updatedAt: now },
    { id: CATEGORY_IDS.knowWell, name: 'Know well', order: 2, createdAt: now, updatedAt: now },
  ]
}

export function defaultColourMeanings(): ColourMeaning[] {
  return [
    { colour: 'blue', label: 'Masculine noun' },
    { colour: 'pink', label: 'Feminine noun' },
    { colour: 'green', label: 'Verb ending' },
    { colour: 'orange', label: 'Irregular' },
    { colour: 'purple', label: 'Stressed syllable' },
    { colour: 'teal', label: 'Your own use' },
  ]
}

/**
 * Build a card side by naming the words to colour rather than counting
 * characters by hand. Used only for this seed data; the editor records real
 * positions from the user's text selection.
 */
function side(text: string, highlights: [string, ColourId][] = []): CardSide {
  return {
    text,
    spans: highlights.flatMap(([phrase, colour]) => {
      const start = text.indexOf(phrase)
      return start === -1 ? [] : [{ start, end: start + phrase.length, colour }]
    }),
  }
}

export function exampleCards(now: string): Card[] {
  const card = (
    englishText: string,
    portuguese: CardSide,
    categoryId: string,
  ): Card => ({
    id: `example-${portuguese.text.replace(/\W+/g, '-').toLowerCase()}`,
    english: side(englishText),
    portuguese,
    categoryId,
    createdAt: now,
    updatedAt: now,
    isExample: true,
  })

  return [
    // Blue and pink: grammatical gender, which has to be learned with the word.
    card('the dog', side('o cão', [['o cão', 'blue']]), CATEGORY_IDS.knowWell),
    card('the cup', side('a chávena', [['a chávena', 'pink']]), CATEGORY_IDS.knowWell),
    card('the train', side('o comboio', [['o comboio', 'blue']]), CATEGORY_IDS.knowALittle),
    card('the bathroom', side('a casa de banho', [['a casa de banho', 'pink']]), CATEGORY_IDS.knowALittle),
    card('breakfast', side('o pequeno-almoço', [['o pequeno-almoço', 'blue']]), CATEGORY_IDS.dontKnow),

    // Green: the ending that changes as a verb conjugates.
    card('I speak', side('eu falo', [['o', 'green']]), CATEGORY_IDS.knowALittle),

    // Green again, on the European Portuguese continuous construction.
    card('I am speaking', side('estou a falar', [['a falar', 'green']]), CATEGORY_IDS.dontKnow),

    // Orange: irregular, and not guessable from the infinitive.
    card('I am (permanently)', side('eu sou', [['sou', 'orange']]), CATEGORY_IDS.dontKnow),

    // Purple: where the stress falls, which drives how the vowels reduce.
    card('difficult', side('difícil', [['fí', 'purple']]), CATEGORY_IDS.dontKnow),

    // Teal: unassigned by default.
    card('please', side('se faz favor', [['faz favor', 'teal']]), CATEGORY_IDS.knowALittle),
  ]
}

export function initialData(now: string): AppData {
  return {
    schemaVersion: SCHEMA_VERSION,
    cards: exampleCards(now),
    categories: defaultCategories(now),
    colourMeanings: defaultColourMeanings(),
    deletions: [],
  }
}
