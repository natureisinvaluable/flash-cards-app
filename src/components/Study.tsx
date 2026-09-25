import { useMemo, useState } from 'react'
import type { AppData, Card } from '../types'
import { sortedCategories } from '../storage'
import { shuffle } from '../shuffle'
import { ColouredText } from './ColouredText'

type Direction = 'portuguese-first' | 'english-first'
const ALL = 'all'

/**
 * Studying: pick a category, see one side, reveal the other, then file the card
 * according to how well you knew it.
 *
 * This is the screen used on a phone, so the tap targets are large and the
 * answer buttons sit at the bottom within thumb reach.
 *
 * The deck is fixed when the session starts. Filing a card changes its category
 * immediately, but does not add or remove anything from the run in progress -
 * otherwise the deck would shift under you as you worked through it.
 */
export function Study({
  data,
  onMove,
  onExit,
}: {
  data: AppData
  onMove: (cardId: string, categoryId: string) => void
  onExit: () => void
}) {
  const categories = sortedCategories(data)

  const [scope, setScope] = useState<string>(ALL)
  const [direction, setDirection] = useState<Direction>('portuguese-first')
  const [deck, setDeck] = useState<Card[] | null>(null)
  const [position, setPosition] = useState(0)
  const [revealed, setRevealed] = useState(false)

  const available = useMemo(
    () => (scope === ALL ? data.cards : data.cards.filter((c) => c.categoryId === scope)),
    [data.cards, scope],
  )

  function start(cards: Card[]) {
    setDeck(shuffle(cards))
    setPosition(0)
    setRevealed(false)
  }

  /* ---------------------------------------------------------------- setup */

  if (deck === null) {
    return (
      <section className="panel study-setup">
        <h2>Study</h2>

        <div className="field">
          <label className="field-label" htmlFor="study-scope">
            Which cards?
          </label>
          <select id="study-scope" value={scope} onChange={(e) => setScope(e.target.value)}>
            <option value={ALL}>All cards ({data.cards.length})</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name} ({data.cards.filter((c) => c.categoryId === category.id).length})
              </option>
            ))}
          </select>
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
            Recognising Portuguese and recalling it are different skills. Both are
            worth practising.
          </p>
        </div>

        <div className="button-row">
          <button type="button" disabled={available.length === 0} onClick={() => start(available)}>
            Start &mdash; {available.length} {available.length === 1 ? 'card' : 'cards'}
          </button>
          <button type="button" className="secondary" onClick={onExit}>
            Back to cards
          </button>
        </div>

        {available.length === 0 && (
          <p className="hint">There are no cards here to study yet.</p>
        )}
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
            Go again, reshuffled
          </button>
          <button type="button" className="secondary" onClick={() => setDeck(null)}>
            Change what I&rsquo;m studying
          </button>
          <button type="button" className="secondary" onClick={onExit}>
            Back to cards
          </button>
        </div>
      </section>
    )
  }

  /* --------------------------------------------------------------- running */

  const card = deck[position]
  // Re-read the card so its category chip is right after it has been filed.
  const live = data.cards.find((c) => c.id === card.id) ?? card
  const front = direction === 'portuguese-first' ? live.portuguese : live.english
  const back = direction === 'portuguese-first' ? live.english : live.portuguese

  function advance() {
    setPosition((p) => p + 1)
    setRevealed(false)
  }

  function fileAs(categoryId: string) {
    if (categoryId !== live.categoryId) onMove(live.id, categoryId)
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
        <button type="button" className="study-card" onClick={() => setRevealed(true)}>
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
                  className={category.id === live.categoryId ? 'secondary current' : 'secondary'}
                  onClick={() => fileAs(category.id)}
                >
                  {category.name}
                  {category.id === live.categoryId && <span className="current-tag">now</span>}
                </button>
              ))}
            </div>
          </>
        ) : (
          <button type="button" className="reveal" onClick={() => setRevealed(true)}>
            Show the answer
          </button>
        )}
      </div>
    </section>
  )
}
