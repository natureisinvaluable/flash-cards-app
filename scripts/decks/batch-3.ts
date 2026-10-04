import type { Entry, Noun, Verb, Word } from '../deck-builder'
import { nounEntries, verbEntries, wordEntries } from '../deck-builder'

/**
 * Batch 3: 100 cards, aimed at an A2 exam (reading, writing, speaking,
 * listening). EUROPEAN Portuguese throughout.
 *
 * Written against the owner's existing 286 cards so nothing repeats. The gaps
 * it fills: the regular verb patterns and reflexives she had no conjugations
 * for, the phrases an oral exam actually turns on, directions, shopping,
 * ordering food, and the time expressions a written exam needs to narrate
 * anything.
 */

export const GENERATED_AT = '2026-10-04T12:00:00.000Z'

const VERBS: Verb[] = [
  {
    slug: 'gostar',
    english: 'to like (gostar de)',
    forms: {
      present: ['gosto', 'gostas', 'gosta', 'gostamos', 'gostam'],
      past: ['gostei', 'gostaste', 'gostou', 'gostámos', 'gostaram'],
      imperfect: ['gostava', 'gostavas', 'gostava', 'gostávamos', 'gostavam'],
    },
    // The accent is the only thing separating past from present in Portugal.
    highlights: { past: [['tá', 'purple']], imperfect: [['tá', 'purple']] },
  },
  {
    slug: 'comer',
    english: 'to eat',
    forms: {
      present: ['como', 'comes', 'come', 'comemos', 'comem'],
      past: ['comi', 'comeste', 'comeu', 'comemos', 'comeram'],
      imperfect: ['comia', 'comias', 'comia', 'comíamos', 'comiam'],
    },
    highlights: { imperfect: [['mí', 'purple']] },
  },
  {
    slug: 'abrir',
    english: 'to open',
    forms: {
      present: ['abro', 'abres', 'abre', 'abrimos', 'abrem'],
      past: ['abri', 'abriste', 'abriu', 'abrimos', 'abriram'],
      imperfect: ['abria', 'abrias', 'abria', 'abríamos', 'abriam'],
    },
    highlights: { imperfect: [['brí', 'purple']] },
  },
  {
    slug: 'preferir',
    english: 'to prefer',
    forms: {
      present: ['prefiro', 'preferes', 'prefere', 'preferimos', 'preferem'],
      past: ['preferi', 'preferiste', 'preferiu', 'preferimos', 'preferiram'],
      imperfect: ['preferia', 'preferias', 'preferia', 'preferíamos', 'preferiam'],
    },
    // The e turns to i in the "eu" form only - a whole family behaves this way.
    highlights: { present: [['prefiro', 'orange']], imperfect: [['rí', 'purple']] },
  },
  {
    slug: 'pagar',
    english: 'to pay',
    forms: {
      present: ['pago', 'pagas', 'paga', 'pagamos', 'pagam'],
      past: ['paguei', 'pagaste', 'pagou', 'pagámos', 'pagaram'],
      imperfect: ['pagava', 'pagavas', 'pagava', 'pagávamos', 'pagavam'],
    },
    highlights: { past: [['paguei', 'orange'], ['gá', 'purple']], imperfect: [['gá', 'purple']] },
  },
  {
    slug: 'lembrar-se',
    english: 'to remember (lembrar-se de)',
    forms: {
      present: ['lembro-me', 'lembras-te', 'lembra-se', 'lembramo-nos', 'lembram-se'],
      past: ['lembrei-me', 'lembraste-te', 'lembrou-se', 'lembrámo-nos', 'lembraram-se'],
      imperfect: ['lembrava-me', 'lembravas-te', 'lembrava-se', 'lembrávamo-nos', 'lembravam-se'],
    },
    // The "nós" form loses its final s before -nos. Easy to miss, always wrong.
    highlights: {
      present: [['lembramo-nos', 'orange']],
      past: [['brá', 'purple']],
      imperfect: [['brá', 'purple']],
    },
  },
]

const NOUNS: Noun[] = [
  // Work and study
  ['a reunião', 'the meeting', 'pink'],
  ['o horário', 'the timetable, the opening hours', 'blue'],
  // Where you live
  ['o prédio', 'the building, the block of flats', 'blue'],
  ['o rés-do-chão', 'the ground floor', 'blue'],
  ['o vizinho', 'the neighbour', 'blue'],
  // Money and paperwork
  ['a fatura', 'the invoice', 'pink'],
  ['o recibo', 'the receipt', 'blue'],
  ['o cartão', 'the card (bank card)', 'blue'],
  ['a senha', 'the queue ticket, the password', 'pink'],
  // Getting around
  ['a esquina', 'the street corner', 'pink'],
  ['o cruzamento', 'the crossroads', 'blue'],
  // Eating out
  ['a entrada', 'the starter, the entrance', 'pink'],
  ['a sobremesa', 'the dessert', 'pink'],
  ['o prato do dia', 'the dish of the day', 'blue'],
  ['a bica', 'the espresso', 'pink'],
  ['o copo', 'the glass', 'blue'],
  ['a garrafa', 'the bottle', 'pink'],
  ['o guardanapo', 'the napkin', 'blue'],
  // Shopping
  ['o tamanho', 'the size', 'blue'],
  ['a montra', 'the shop window', 'pink'],
  ['o desconto', 'the discount', 'blue'],
  ['os saldos', 'the sales', 'blue'],
]

const WORDS: Word[] = [
  // --- Adjectives ---
  ['simpático', 'nice, friendly'],
  ['antipático', 'unfriendly'],
  ['barulhento', 'noisy'],
  ['calmo', 'calm, quiet'],
  ['doente', 'ill'],
  ['saudável', 'healthy'],
  ['preocupado', 'worried'],
  ['magro', 'thin'],
  ['gordo', 'fat'],
  ['jovem', 'young'],
  ['velho', 'old'],
  ['forte', 'strong'],
  ['fraco', 'weak'],

  // --- Making yourself understood: the oral exam turns on these ---
  ['Pode repetir, se faz favor?', 'Could you repeat that, please?'],
  ['Pode falar mais devagar?', 'Could you speak more slowly?'],
  ['Não percebi', "I didn't understand"],
  ['Como se diz ... em português?', 'How do you say ... in Portuguese?'],
  ['O que significa isso?', 'What does that mean?'],

  // --- Giving an opinion: the written and spoken exams both want these ---
  ['Na minha opinião', 'In my opinion'],
  ['Acho que sim', 'I think so'],
  ['Acho que não', "I don't think so"],
  ['Em primeiro lugar', 'Firstly, in the first place'],
  ['Por fim', 'Finally, lastly'],
  ['Além disso', 'Besides, what is more'],
  ['Por isso', 'So, that is why'],
  ['Depende', 'It depends'],

  // --- Out and about ---
  ['Quanto custa?', 'How much does it cost?'],
  ['Fica longe daqui?', 'Is it far from here?'],
  ['Vire à direita', 'Turn right'],
  ['Vire à esquerda', 'Turn left'],
  ['Siga sempre em frente', 'Keep going straight ahead'],
  ['Posso pagar com cartão?', 'Can I pay by card?'],
  ['Queria marcar uma consulta', 'I would like to make an appointment'],
  ['Estou à procura de', 'I am looking for'],
  ['Tenho de ir', 'I have to go'],
  ['Não faz mal', 'Never mind, it does not matter'],

  // --- Everyday verbs and set expressions ---
  ['apetecer', 'to feel like (apetece-me um café)'],
  ['ter saudades de', 'to miss (a person or place)'],
  ['ficar com', 'to keep, to take (I will take it)'],
  ['ir buscar', 'to go and fetch, to pick up'],
  ['dar-se bem com', 'to get on well with'],
  ['tomar conta de', 'to look after'],
  ['pôr a mesa', 'to lay the table'],
  ['fazer anos', 'to have a birthday'],
  ['ter razão', 'to be right'],
  ['deitar fora', 'to throw away'],
  ['há / houve / havia', 'there is / there was / there used to be'],

  // --- Time: a written exam cannot narrate anything without these ---
  ['a semana passada', 'last week'],
  ['no próximo mês', 'next month'],
  ['anteontem', 'the day before yesterday'],
  ['depois de amanhã', 'the day after tomorrow'],
  ['de manhã', 'in the morning'],
  ['à tarde', 'in the afternoon'],
  ['à noite', 'at night, in the evening'],
  ['o fim de semana', 'the weekend'],
  ['daqui a pouco', 'in a little while'],

  // --- Joining sentences together ---
  ['assim que', 'as soon as'],
  ['enquanto', 'while'],
  ['por enquanto', 'for now, for the time being'],
]

/**
 * One card earns a colour outside the usual rules. `constipado` does not mean
 * constipated - it means having a cold - and that is the kind of mistake worth
 * flagging before it is made in public.
 */
const TRAPS: Entry[] = [
  {
    id: 'starter-estar-constipado',
    english: 'to have a cold (NOT constipated)',
    portuguese: 'estar constipado',
    highlights: [['constipado', 'orange']],
  },
]

export const entries: Entry[] = [
  ...verbEntries(VERBS),
  ...nounEntries(NOUNS),
  ...wordEntries(WORDS),
  ...TRAPS,
]
