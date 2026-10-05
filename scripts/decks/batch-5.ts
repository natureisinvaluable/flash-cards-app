import type { Entry } from '../deck-builder'

/**
 * Batch 5: fixed phrases whose grammar is well above A2, learned whole.
 *
 * Most of these contain a subjunctive - present, future or past. Nobody at A2
 * can build those from rules, but the phrases are needed long before the
 * grammar arrives, so they are taught as single units with the awkward part
 * marked rather than explained.
 *
 * Teal marks the word doing the work that is beyond A2. Seeing the same colour
 * fall on `esteja`, `houver`, `chegares`, `quiseres` and `fosse` across
 * different cards is the point: the pattern is visible long before it can be
 * named.
 *
 * English sides are English only. EUROPEAN Portuguese throughout.
 */

export const GENERATED_AT = '2026-10-05T14:00:00.000Z'

export const entries: Entry[] = [
  /* ------------------------------------------------------ hoping, wishing */
  {
    id: 'phrase-espero-tudo-bem',
    english: 'I hope all is well.',
    portuguese: 'Espero que esteja tudo bem.',
    highlights: [['esteja', 'teal']],
  },
  {
    id: 'phrase-espero-estejas-bem',
    english: 'I hope you are well.\n(to a friend)',
    portuguese: 'Espero que estejas bem.',
    highlights: [['estejas', 'teal']],
  },
  {
    id: 'phrase-espero-corra-bem',
    english: 'I hope it all goes well.',
    portuguese: 'Espero que corra tudo bem.',
    highlights: [['corra', 'teal']],
  },
  {
    id: 'phrase-noticias-em-breve',
    english: 'I hope to hear from you soon.',
    portuguese: 'Espero ter notícias em breve.',
  },

  /* --------------------------------------------------------- if and when */
  {
    id: 'phrase-se-houver-tempo',
    english: 'If there is time, maybe we can go to the beach.',
    portuguese: 'Se houver tempo, talvez possamos ir à praia.',
    highlights: [['houver', 'teal'], ['possamos', 'teal']],
  },
  {
    id: 'phrase-quando-chegares',
    english: 'When you arrive, send me a message.',
    portuguese: 'Quando chegares, manda-me uma mensagem.',
    highlights: [['chegares', 'teal']],
  },
  {
    id: 'phrase-se-quiseres-ajudo',
    english: 'If you want, I can help you.',
    portuguese: 'Se quiseres, posso ajudar-te.',
    highlights: [['quiseres', 'teal']],
  },
  {
    id: 'phrase-se-precisares',
    english: 'Let me know if you need anything.',
    portuguese: 'Diz-me se precisares de alguma coisa.',
    highlights: [['precisares', 'teal']],
  },
  {
    id: 'phrase-o-que-quiseres',
    english: 'Whatever you want.',
    portuguese: 'O que quiseres.',
    highlights: [['quiseres', 'teal']],
  },

  /* ------------------------------------------------- maybe, and what a shame */
  {
    id: 'phrase-talvez-possamos',
    english: 'Maybe we can meet tomorrow.',
    portuguese: 'Talvez possamos encontrar-nos amanhã.',
    highlights: [['possamos', 'teal']],
  },
  {
    id: 'phrase-e-pena-que',
    english: "It's a shame you can't come.",
    portuguese: 'É pena que não possas vir.',
    highlights: [['possas', 'teal']],
  },

  /* ------------------------------------------------- waiting and arranging */
  {
    id: 'phrase-a-tua-espera',
    english: 'I am waiting for you at the station.',
    portuguese: 'Estou à tua espera na estação.',
    highlights: [['à tua espera', 'teal']],
  },
  {
    id: 'phrase-espero-por-ti',
    english: 'I will wait for you outside.',
    portuguese: 'Espero por ti lá fora.',
  },
  {
    id: 'phrase-estou-a-caminho',
    english: 'I am on my way.',
    portuguese: 'Estou a caminho.',
  },
  {
    id: 'phrase-chego-daqui-a',
    english: 'I will be there in ten minutes.',
    portuguese: 'Chego daqui a dez minutos.',
  },

  /* --------------------------------------------------------- being polite */
  {
    id: 'phrase-podia-ajudar-me',
    english: 'Could you help me, please?',
    portuguese: 'Podia ajudar-me, se faz favor?',
    highlights: [['Podia', 'teal']],
  },
  {
    id: 'phrase-gostaria-de-falar',
    english: 'I would like to speak to...',
    portuguese: 'Gostaria de falar com...',
    highlights: [['Gostaria', 'teal']],
  },
  {
    id: 'phrase-importa-se-de',
    english: 'Would you mind waiting a moment?',
    portuguese: 'Importa-se de esperar um momento?',
    highlights: [['Importa-se', 'teal']],
  },
  {
    id: 'phrase-preferia-ficar',
    english: 'I would rather stay at home.',
    portuguese: 'Preferia ficar em casa.',
    highlights: [['Preferia', 'teal']],
  },

  /* ------------------------------------------------------------- hedging */
  {
    id: 'phrase-tanto-quanto-sei',
    english: 'As far as I know...',
    portuguese: 'Tanto quanto sei...',
  },
  {
    id: 'phrase-nao-tenho-a-certeza',
    english: 'I am not sure.',
    portuguese: 'Não tenho a certeza.',
  },
  {
    id: 'phrase-tanto-faz',
    english: "It's all the same to me.",
    portuguese: 'Para mim, tanto faz.',
  },
  {
    id: 'phrase-como-quiseres',
    english: "It's up to you.",
    portuguese: 'Como quiseres.',
    highlights: [['quiseres', 'teal']],
  },
  {
    id: 'phrase-por-via-das-duvidas',
    english: 'Just in case.',
    portuguese: 'Só por via das dúvidas.',
  },

  /* -------------------------------------------------- wishing things were otherwise */
  {
    id: 'phrase-se-eu-fosse-a-ti',
    english: "If I were you, I wouldn't do that.",
    portuguese: 'Se eu fosse a ti, não fazia isso.',
    highlights: [['fosse', 'teal']],
  },
  {
    id: 'phrase-quem-me-dera',
    english: 'I wish I could.',
    portuguese: 'Quem me dera poder.',
    highlights: [['Quem me dera', 'teal']],
  },

  /* ----------------------------------------------------------- in writing */
  {
    id: 'phrase-desde-ja-obrigada',
    english: 'Thank you in advance.\n(said by a woman)',
    portuguese: 'Desde já, obrigada.',
  },
  {
    id: 'phrase-desculpe-a-demora',
    english: 'Sorry for the delay in replying.',
    portuguese: 'Desculpe a demora na resposta.',
  },
]
