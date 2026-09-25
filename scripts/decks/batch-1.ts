import type { Entry, Noun, Verb, Word } from '../deck-builder'
import { nounEntries, verbEntries, wordEntries } from '../deck-builder'

/** Batch 1: 50 cards. Already published; do not change ids or content. */

export const GENERATED_AT = '2026-09-25T12:00:00.000Z'

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
    // têm against tem is one of the classic written-accent traps.
    highlights: { present: [['têm', 'orange']], imperfect: [['tí', 'purple']] },
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
    // pôde (past) against pode (present) - the same trap as têm.
    highlights: { past: [['pôde', 'orange']], imperfect: [['dí', 'purple']] },
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

const NOUNS: Noun[] = [
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

const WORDS: Word[] = [
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

export const entries: Entry[] = [
  ...verbEntries(VERBS),
  ...nounEntries(NOUNS),
  ...wordEntries(WORDS),
]
