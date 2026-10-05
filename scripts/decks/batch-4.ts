import type { Entry } from '../deck-builder'

/**
 * Batch 4: grammar, taught through example sentences.
 *
 * The English side is ENGLISH ONLY - no Portuguese words, and no grammatical
 * terms borrowed from Portuguese. A few carry a short English clarifier, such
 * as "(formal, written style)", but only where the sentence alone would have
 * more than one right answer and the card would otherwise mark itself wrong.
 *
 * Colour here is used slightly differently from the vocabulary decks, because
 * these cards are about structure rather than words:
 *
 *   green  - the verb structure the card is demonstrating
 *   teal   - the one word the card exists to teach
 *   orange - a trap
 *   purple - a stressed syllable already marked by a written accent
 *
 * Teal is the colour with no fixed meaning, so it is doing the work of "look
 * here" throughout. Rename it in Settings if that is useful.
 */

export const GENERATED_AT = '2026-10-05T12:00:00.000Z'

export const entries: Entry[] = [
  /* ------------------------------------------------- had done (tinha + …) */
  {
    id: 'grammar-mqp-cheguei',
    english: 'When I arrived, they had already eaten.',
    portuguese: 'Quando cheguei, eles já tinham comido.',
    highlights: [['tinham comido', 'green']],
  },
  {
    id: 'grammar-mqp-lisboa',
    english: 'I had never been to Lisbon before.',
    portuguese: 'Eu nunca tinha estado em Lisboa antes.',
    highlights: [['tinha estado', 'green']],
  },
  {
    id: 'grammar-mqp-chaves',
    english: 'She said she had lost the keys.',
    portuguese: 'Ela disse que tinha perdido as chaves.',
    highlights: [['tinha perdido', 'green']],
  },
  {
    id: 'grammar-mqp-simples',
    english: 'He had already left when the letter arrived.\n(formal, written style — one word, no helper verb)',
    portuguese: 'Já partira quando a carta chegou.',
    highlights: [['partira', 'green']],
  },
  {
    id: 'grammar-participios-irregulares',
    english: 'the past participles of:\nto do · to say · to see · to put · to open · to write',
    portuguese: 'feito · dito · visto · posto · aberto · escrito',
  },

  /* ------------------------------ have been doing, lately (tenho + …) */
  {
    id: 'grammar-ppc-comido',
    english: 'I have been eating a lot lately.',
    portuguese: 'Tenho comido muito ultimamente.',
    highlights: [['Tenho comido', 'green']],
  },
  {
    id: 'grammar-ppc-chovido',
    english: 'It has been raining all week.',
    portuguese: 'Tem chovido toda a semana.',
    highlights: [['Tem chovido', 'green']],
  },
  {
    id: 'grammar-ppc-trabalhado',
    english: 'We have been working a lot this month.',
    portuguese: 'Temos trabalhado muito este mês.',
    highlights: [['Temos trabalhado', 'green']],
  },
  {
    id: 'grammar-ppc-contraste',
    english: 'I have already eaten.\n(one finished action, not something repeated)',
    portuguese: 'Já comi.',
  },

  /* ----------------------------------------------- direct object pronouns */
  {
    id: 'grammar-direto-vi-a',
    english: 'I saw her yesterday.',
    portuguese: 'Vi-a ontem.',
    highlights: [['-a', 'teal']],
  },
  {
    id: 'grammar-direto-nao-a-vi',
    english: "I didn't see her.",
    portuguese: 'Não a vi.',
    highlights: [['a vi', 'teal']],
  },
  {
    id: 'grammar-direto-compra-lo',
    english: 'I am going to buy it.',
    portuguese: 'Vou comprá-lo.',
    highlights: [['-lo', 'teal'], ['á', 'purple']],
  },
  {
    id: 'grammar-direto-convidaram-nos',
    english: 'They invited us.',
    portuguese: 'Convidaram-nos.',
    highlights: [['-nos', 'teal']],
  },
  {
    id: 'grammar-direto-onde-o-compraste',
    english: 'Where did you buy it?',
    portuguese: 'Onde o compraste?',
    highlights: [['o compraste', 'teal']],
  },
  {
    id: 'grammar-direto-nao-os-conheco',
    english: "I don't know them.",
    portuguese: 'Não os conheço.',
    highlights: [['os conheço', 'teal']],
  },

  /* --------------------------------------------- indirect object pronouns */
  {
    id: 'grammar-indireto-dei-lhe',
    english: 'I gave him the book.',
    portuguese: 'Dei-lhe o livro.',
    highlights: [['-lhe', 'teal']],
  },
  {
    id: 'grammar-indireto-me-disse',
    english: "She didn't tell me anything.",
    portuguese: 'Ela não me disse nada.',
    highlights: [['me disse', 'teal']],
  },
  {
    id: 'grammar-indireto-enviar-lhes',
    english: 'I am going to send them an email.',
    portuguese: 'Vou enviar-lhes um email.',
    highlights: [['-lhes', 'teal']],
  },
  {
    id: 'grammar-indireto-deu-mo',
    english: 'He gave it to me.\n(the two pronouns join into one)',
    portuguese: 'Deu-mo.',
    highlights: [['-mo', 'teal']],
  },

  /* ---------------------------------------------------------- acabar */
  {
    id: 'grammar-acabar-de',
    english: 'I have just arrived.',
    portuguese: 'Acabei de chegar.',
    highlights: [['de', 'teal']],
  },
  {
    id: 'grammar-acabar-por',
    english: 'We ended up staying at home.',
    portuguese: 'Acabámos por ficar em casa.',
    highlights: [['por', 'teal'], ['bá', 'purple']],
  },
  {
    id: 'grammar-acabar-sozinho',
    english: 'The film finished late.',
    portuguese: 'O filme acabou tarde.',
  },
  {
    id: 'grammar-acabar-com',
    english: 'She broke up with her boyfriend.',
    portuguese: 'Ela acabou com o namorado.',
    highlights: [['com', 'teal']],
  },

  /* ------------------------------- four verbs English calls "to take" */
  {
    id: 'grammar-tirar-casaco',
    english: 'Take off your coat.',
    portuguese: 'Tira o casaco.',
  },
  {
    id: 'grammar-tirar-fotografia',
    english: 'I am going to take a photo.',
    portuguese: 'Vou tirar uma fotografia.',
  },
  {
    id: 'grammar-apanhar-autocarro',
    english: 'I catch the bus every day.',
    portuguese: 'Apanho o autocarro todos os dias.',
  },
  {
    id: 'grammar-apanhar-constipacao',
    english: 'I caught a cold.',
    portuguese: 'Apanhei uma constipação.',
  },
  {
    id: 'grammar-levar-guarda-chuva',
    english: 'Take an umbrella with you.',
    portuguese: 'Leva um guarda-chuva contigo.',
  },
  {
    id: 'grammar-tomar-medicamento',
    english: 'I take this medicine every morning.',
    portuguese: 'Tomo este medicamento todas as manhãs.',
  },
  {
    id: 'grammar-tomar-cafe',
    english: 'Shall we have a coffee?',
    portuguese: 'Vamos tomar um café?',
  },

  /* ------------------------------------------------------- so / so much */
  {
    id: 'grammar-tao-quente',
    english: 'This coffee is so hot.',
    portuguese: 'Este café está tão quente.',
    highlights: [['tão', 'teal']],
  },
  {
    id: 'grammar-tanta-gente',
    english: 'There were so many people.',
    portuguese: 'Havia tanta gente.',
    highlights: [['tanta', 'teal']],
  },
  {
    id: 'grammar-tanto-comi',
    english: 'I ate so much.',
    portuguese: 'Comi tanto.',
    highlights: [['tanto', 'teal']],
  },
  {
    id: 'grammar-tao-como',
    english: 'She is as tall as her sister.',
    portuguese: 'Ela é tão alta como a irmã.',
    highlights: [['tão', 'teal'], ['como', 'teal']],
  },
  {
    id: 'grammar-tanto-como',
    english: "I don't have as much money as you.",
    portuguese: 'Não tenho tanto dinheiro como tu.',
    highlights: [['tanto', 'teal'], ['como', 'teal']],
  },
]
