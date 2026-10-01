import { useState } from 'react'
import type { Card, CardState, Category } from '../types'
import { arrangeCards, ORDER_LABELS, type Order } from '../studyOrder'
import { ColouredText } from './ColouredText'

type Direction = 'portuguese-first' | 'english-first'

const ALL = 'all'
const UNSORTED = 'unsorted'

/**
 * Studying: pick which cards, see one side, reveal the other, then file the
 * card according to how well you knew it.
 *
 * Built for a phone: large tap targets, answer buttons at the bottom within
 * thumb reach.
 *
 * Everything here is yours. The cards are shared, but which ones you study,
 * how you file them and when you last saw each one are yours alone.
 */
export function Study({
  cards,
  categories,
  states,
  onFile,
  onViewed,
  onExit,
}: {
  cards: Card[]
  categories: Category[]
  states: Record<string, CardState>
  onFile: (cardId: string, categoryId: string | null) => void
  onViewed: (cardId: string) => void
  onExit: () => void
}) {
  const [scope, setScope] = useState<string>(ALL)
  const [direction, setDirection] = useState<Direction>('portuguese-first')
  const [order, setOrder] = useState<Order>('shuffled')
  const [deck, setDeck] = useState<Card[] | null>(null)
  const [position, setPosition] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const categoryOf = (card: Card) => states[card.id]?.categoryId ?? null

  const available =
    scope === ALL
      ? cards
      : scope === UNSORTED
        ? cards.filter((c) => categoryOf(c) === null)
        : cards.filter((c) => categoryOf(c) === scope)

  function start(selection: Card[]) {
    setDeck(arrangeCards(selection, states, order))
    setPosition(0)
    setRevealed(false)
  }

  /* ---------------------------------------------------------------- setup */

  if (deck === null) {
    const unsortedCount = cards.filter((c) => categoryOf(c) === null).length

    return (
      <section className="panel study-setup">
        <h2>Study</h2>

        <div className="field">
          <label className="field-label" htmlFor="study-scope">
            Which cards?
          </label>
          <select id="study-scope" value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value={ALL}>All cards ({cards.length})</option>
            {unsortedCount > 0 && <option value={UNSORTED}>New, unsorted ({unsortedCount})</option>}
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({cards.filter((c) => categoryOf(c) === category.id).length})
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="study-order">
            In what order?
          </label>
          <select id="study-order" value={order} onChange={(e) => setOrder(e.target.value as Order)}>
            {(Object.keys(ORDER_LABELS) as Order[]).map((value) => (
              <option key={value} value={value}>
                {ORDER_LABELS[value]}
              </option>
            ))}
          </select>
          <p className="hint">
            &ldquo;Least recently seen&rdquo; brings round the cards you have
            neglected, and counts one you have never seen as the most overdue of
            all. This is your own history &mdash; nobody else&rsquo;s viewing
            affects it.
          </p>
        </div>

        <div className="field">
          <span className="field-label">Which side first?</span>
          <div className="button-row">
            <button
              type="button"
              className={direction === 'portuguese-first' ? '' : 'secondary'}
              onClick={() => setDirection('portuguese-first')}
            >
              Portuguese first
            </button>
            <button
              type="button"
              className={direction === 'english-first' ? '' : 'secondary'}
              onClick={() => setDirection('english-first')}
            >
              English first
            </button>
          </div>
          <p className="hint">
            Recognising Portuguese and recalling it are different skills. Both
            are worth practising.
          </p>
        </div>

        <div className="button-row">
          <button type="button" disabled={available.length === 0} onClick={() => start(available)}>
            Start &mdash; {available.length} {available.length === 1 ? 'card' : 'cards'}
          </button>
          <button type="button" className="secondary" onClick={onExit}>
            Back to the cards
          </button>
        </div>

        {available.length === 0 && <p className="hint">There are no cards here to study.</p>}
      </section>
    )
  }

  /* -------------------------------------------------------------- finished */

  if (position >= deck.length) {
    return (
      <section className="panel study-done">
        <h2>Session finished</h2>
        <p>
          You went through {deck.length} {deck.length === 1 ? 'card' : 'cards'}.
        </p>
        <div className="button-row">
          <button type="button" onClick={() => start(deck)}>
            Go again
          </button>
          <button type="button" className="secondary" onClick={() => setDeck(null)}>
            Change what I&rsquo;m studying
          </button>
          <button type="button" className="secondary" onClick={onExit}>
            Back to the cards
          </button>
        </div>
      </section>
    )
  }

  /* --------------------------------------------------------------- running */

  const card = deck[position]
  const currentCategory = categoryOf(card)
  const front = direction === 'portuguese-first' ? card.portuguese : card.english
  const back = direction === 'portuguese-first' ? card.english : card.portuguese

  function reveal() {
    if (revealed) return
    setRevealed(true)
    onViewed(card.id)
  }

  function advance() {
    setPosition((p) => p + 1)
    setRevealed(false)
  }

  function fileAs(categoryId: string | null) {
    if (categoryId !== currentCategory) onFile(card.id, categoryId)
    advance()
  }

  return (
    <section className="study">
      <div className="study-bar">
        <span className="progress">
          {position + 1} of {deck.length}
        </span>
        <button type="button" className="secondary small" onClick={onExit}>
          Finish
        </button>
      </div>

      {revealed ? (
        <div className="study-card revealed">
          <p className="study-front">
            <ColouredText side={front} />
          </p>
          <hr />
          <p className="study-back">
            <ColouredText side={back} />
          </p>
        </div>
      ) : (
        <button type="button" className="study-card" onClick={reveal}>
          <span className="study-front">
            <ColouredText side={front} />
          </span>
          <span className="study-tap-hint">Tap to see the answer</span>
        </button>
      )}

      <div className="study-controls">
        {revealed ? (
          <>
            <p className="study-question">How well did you know it?</p>
            <div className="study-answers">
              {categories.map((category) => (
                <button
                  key={category.id}
                  type="button"
                  className={category.id === currentCategory ? 'secondary current' : 'secondary'}
                  onClick={() => fileAs(category.id)}
                >
                  {category.name}
                  {category.id === currentCategory && <span className="current-tag">now</span>}
                </button>
              ))}
              {currentCategory === null && (
                <button type="button" className="secondary" onClick={() => fileAs(null)}>
                  Skip for now
                </button>
              )}
            </div>
          </>
        ) : (
          <button type="button" className="reveal" onClick={reveal}>
            Show the answer
          </button>
        )}
      </div>
    </section>
  )
}
