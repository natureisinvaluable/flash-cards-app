import type { Entry, Noun, Verb, Word } from '../deck-builder'
import { nounEntries, verbEntries, wordEntries } from '../deck-builder'

/**
 * Batch 2: 100 cards. 16 verbs x 3 tenses, plus 52 other words.
 *
 * EUROPEAN Portuguese throughout. Two European markers appear deliberately:
 *  - The -ar past "nós" form keeps its acute accent (ficámos, chegámos,
 *    começámos), which is what distinguishes it from the present in Portugal.
 *  - "veem" has no circumflex under the current spelling agreement, while
 *    "vêm" and "têm" keep theirs.
 */

export const GENERATED_AT = '2026-09-25T13:00:00.000Z'

const VERBS: Verb[] = [
  {
    slug: 'ver',
    english: 'to see',
    forms: {
      present: ['vejo', 'vês', 'vê', 'vemos', 'veem'],
      past: ['vi', 'viste', 'viu', 'vimos', 'viram'],
      imperfect: ['via', 'vias', 'via', 'víamos', 'viam'],
    },
    highlights: { imperfect: [['ví', 'purple']] },
  },
  {
    slug: 'vir',
    english: 'to come',
    forms: {
      present: ['venho', 'vens', 'vem', 'vimos', 'vêm'],
      past: ['vim', 'vieste', 'veio', 'viemos', 'vieram'],
      imperfect: ['vinha', 'vinhas', 'vinha', 'vínhamos', 'vinham'],
    },
    // vêm against vem, exactly as têm against tem.
    highlights: { present: [['vêm', 'orange']], imperfect: [['ví', 'purple']] },
  },
  {
    slug: 'por',
    english: 'to put (pôr)',
    forms: {
      present: ['ponho', 'pões', 'põe', 'pomos', 'põem'],
      past: ['pus', 'puseste', 'pôs', 'pusemos', 'puseram'],
      imperfect: ['punha', 'punhas', 'punha', 'púnhamos', 'punham'],
    },
    highlights: { past: [['pôs', 'orange']], imperfect: [['pú', 'purple']] },
  },
  {
    slug: 'dar',
    english: 'to give',
    forms: {
      present: ['dou', 'dás', 'dá', 'damos', 'dão'],
      past: ['dei', 'deste', 'deu', 'demos', 'deram'],
      imperfect: ['dava', 'davas', 'dava', 'dávamos', 'davam'],
    },
    highlights: { imperfect: [['dá', 'purple']] },
  },
  {
    slug: 'dizer',
    english: 'to say, to tell',
    forms: {
      present: ['digo', 'dizes', 'diz', 'dizemos', 'dizem'],
      past: ['disse', 'disseste', 'disse', 'dissemos', 'disseram'],
      imperfect: ['dizia', 'dizias', 'dizia', 'dizíamos', 'diziam'],
    },
    highlights: { imperfect: [['zí', 'purple']] },
  },
  {
    slug: 'trazer',
    english: 'to bring',
    forms: {
      present: ['trago', 'trazes', 'traz', 'trazemos', 'trazem'],
      past: ['trouxe', 'trouxeste', 'trouxe', 'trouxemos', 'trouxeram'],
      imperfect: ['trazia', 'trazias', 'trazia', 'trazíamos', 'traziam'],
    },
    highlights: { imperfect: [['zí', 'purple']] },
  },
  {
    slug: 'sair',
    english: 'to go out, to leave',
    forms: {
      present: ['saio', 'sais', 'sai', 'saímos', 'saem'],
      past: ['saí', 'saíste', 'saiu', 'saímos', 'saíram'],
      imperfect: ['saía', 'saías', 'saía', 'saíamos', 'saíam'],
    },
  },
  {
    slug: 'ouvir',
    english: 'to hear',
    forms: {
      present: ['ouço', 'ouves', 'ouve', 'ouvimos', 'ouvem'],
      past: ['ouvi', 'ouviste', 'ouviu', 'ouvimos', 'ouviram'],
      imperfect: ['ouvia', 'ouvias', 'ouvia', 'ouvíamos', 'ouviam'],
    },
    highlights: { present: [['ouço', 'orange']], imperfect: [['ví', 'purple']] },
  },
  {
    slug: 'pedir',
    english: 'to ask for',
    forms: {
      present: ['peço', 'pedes', 'pede', 'pedimos', 'pedem'],
      past: ['pedi', 'pediste', 'pediu', 'pedimos', 'pediram'],
      imperfect: ['pedia', 'pedias', 'pedia', 'pedíamos', 'pediam'],
    },
    highlights: { present: [['peço', 'orange']], imperfect: [['dí', 'purple']] },
  },
  {
    slug: 'perder',
    english: 'to lose',
    forms: {
      present: ['perco', 'perdes', 'perde', 'perdemos', 'perdem'],
      past: ['perdi', 'perdeste', 'perdeu', 'perdemos', 'perderam'],
      imperfect: ['perdia', 'perdias', 'perdia', 'perdíamos', 'perdiam'],
    },
    highlights: { present: [['perco', 'orange']], imperfect: [['dí', 'purple']] },
  },
  {
    slug: 'dormir',
    english: 'to sleep',
    forms: {
      present: ['durmo', 'dormes', 'dorme', 'dormimos', 'dormem'],
      past: ['dormi', 'dormiste', 'dormiu', 'dormimos', 'dormiram'],
      imperfect: ['dormia', 'dormias', 'dormia', 'dormíamos', 'dormiam'],
    },
    highlights: { present: [['durmo', 'orange']], imperfect: [['mí', 'purple']] },
  },
  {
    slug: 'sentir',
    english: 'to feel',
    forms: {
      present: ['sinto', 'sentes', 'sente', 'sentimos', 'sentem'],
      past: ['senti', 'sentiste', 'sentiu', 'sentimos', 'sentiram'],
      imperfect: ['sentia', 'sentias', 'sentia', 'sentíamos', 'sentiam'],
    },
    highlights: { present: [['sinto', 'orange']], imperfect: [['tí', 'purple']] },
  },
  {
    slug: 'conseguir',
    english: 'to manage to, to be able to',
    forms: {
      present: ['consigo', 'consegues', 'consegue', 'conseguimos', 'conseguem'],
      past: ['consegui', 'conseguiste', 'conseguiu', 'conseguimos', 'conseguiram'],
      imperfect: ['conseguia', 'conseguias', 'conseguia', 'conseguíamos', 'conseguiam'],
    },
    highlights: { present: [['consigo', 'orange']], imperfect: [['guí', 'purple']] },
  },
  {
    slug: 'ficar',
    english: 'to stay, to become',
    forms: {
      present: ['fico', 'ficas', 'fica', 'ficamos', 'ficam'],
      past: ['fiquei', 'ficaste', 'ficou', 'ficámos', 'ficaram'],
      imperfect: ['ficava', 'ficavas', 'ficava', 'ficávamos', 'ficavam'],
    },
    // The accent on ficámos is what separates past from present in Portugal.
    highlights: { past: [['fiquei', 'orange'], ['cá', 'purple']], imperfect: [['cá', 'purple']] },
  },
  {
    slug: 'chegar',
    english: 'to arrive',
    forms: {
      present: ['chego', 'chegas', 'chega', 'chegamos', 'chegam'],
      past: ['cheguei', 'chegaste', 'chegou', 'chegámos', 'chegaram'],
      imperfect: ['chegava', 'chegavas', 'chegava', 'chegávamos', 'chegavam'],
    },
    highlights: { past: [['cheguei', 'orange'], ['gá', 'purple']], imperfect: [['gá', 'purple']] },
  },
  {
    slug: 'comecar',
    english: 'to begin, to start',
    forms: {
      present: ['começo', 'começas', 'começa', 'começamos', 'começam'],
      past: ['comecei', 'começaste', 'começou', 'começámos', 'começaram'],
      imperfect: ['começava', 'começavas', 'começava', 'começávamos', 'começavam'],
    },
    highlights: { past: [['comecei', 'orange'], ['çá', 'purple']], imperfect: [['çá', 'purple']] },
  },
]

const NOUNS: Noun[] = [
  ['o almoço', 'lunch', 'blue'],
  ['o jantar', 'dinner', 'blue'],
  ['a ementa', 'the menu', 'pink'],
  ['a conta', 'the bill', 'pink'],
  ['o troco', 'the change (money)', 'blue'],
  ['a esquadra', 'the police station', 'pink'],
  ['o correio', 'the post office, the post', 'blue'],
  ['a farmácia', "the chemist's", 'pink'],
  ['o médico', 'the doctor', 'blue'],
  ['a consulta', 'the appointment', 'pink'],
  ['o quarto', 'the bedroom', 'blue'],
  ['a cozinha', 'the kitchen', 'pink'],
  ['o fogão', 'the cooker', 'blue'],
  ['a chave', 'the key', 'pink'],
  ['o andar', 'the floor, the storey', 'blue'],
  ['o elevador', 'the lift', 'blue'],
  ['o bilhete', 'the ticket', 'blue'],
  ['a fila', 'the queue', 'pink'],
  ['o feriado', 'the public holiday', 'blue'],
  ['a praia', 'the beach', 'pink'],
  ['o nevoeiro', 'the fog', 'blue'],
  ['a chuva', 'the rain', 'pink'],
  ['o ecrã', 'the screen', 'blue'],
  ['a palavra', 'the word', 'pink'],
]

const WORDS: Word[] = [
  // Adjectives
  ['giro', 'nice, pretty, cool'],
  ['chato', 'annoying, boring'],
  ['fixe', 'cool, great'],
  ['esquisito', 'strange, odd (NOT exquisite)'],
  ['engraçado', 'funny'],
  ['lento', 'slow'],
  ['limpo', 'clean'],
  ['sujo', 'dirty'],
  ['pesado', 'heavy'],
  ['leve', 'light (in weight)'],
  ['estreito', 'narrow'],
  ['largo', 'wide'],
  ['escuro', 'dark'],
  ['claro', 'light, clear'],
  // Adverbs and phrases
  ['se calhar', 'maybe, perhaps'],
  ['de certeza', 'definitely, for sure'],
  ['por acaso', 'by any chance, as it happens'],
  ['em vez de', 'instead of'],
  ['ao pé de', 'next to, beside'],
  ['a seguir', 'next, afterwards'],
  ['de repente', 'suddenly'],
  ['às vezes', 'sometimes'],
  ['pelo menos', 'at least'],
  ['sobretudo', 'above all, especially'],
  ['entretanto', 'meanwhile'],
  ['de propósito', 'on purpose'],
  ['à vontade', 'at ease, freely'],
  ['pois é', "that's right, indeed"],
]

export const entries: Entry[] = [
  ...verbEntries(VERBS),
  ...nounEntries(NOUNS),
  ...wordEntries(WORDS),
]
