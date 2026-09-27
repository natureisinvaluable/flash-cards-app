import { useEffect, useState } from 'react'
import type { Card } from '../types'
import { fetchCards } from '../cards'
import { ColouredText } from './ColouredText'

/**
 * The shared pool, read only for now.
 *
 * Everyone signed in sees exactly these cards. Filing them into your own
 * categories, and adding to them, arrive in the stages that follow.
 */
export function SharedCards() {
  const [cards, setCards] = useState<Card[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchCards()
      .then((loaded) => {
        if (!cancelled) setCards(loaded)
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })
    return () => {
      cancelled = true
    }
  }, [])

  if (error) {
    return (
      <p className="notice warning" role="alert">
        Could not load the cards: {error}
      </p>
    )
  }

  if (cards === null) return <p className="hint">Loading the shared cards&hellip;</p>

  if (cards.length === 0) {
    return (
      <section className="panel">
        <h2>No cards yet</h2>
        <p>
          The shared pool is empty. Cards added by anyone will appear here for
          everyone.
        </p>
      </section>
    )
  }

  return (
    <section>
      <h2 className="pool-heading">
        Shared cards <span className="count">{cards.length}</span>
      </h2>
      <p className="hint pool-note">
        Everyone sees the same cards. How well <em>you</em> know each one is
        yours alone, and arrives in the next stage.
      </p>

      <ul className="card-grid">
        {cards.map((card) => (
          <li key={card.id} className="card">
            <span className="card-portuguese">
              <ColouredText side={card.portuguese} />
            </span>
            <span className="card-english">
              <ColouredText side={card.english} />
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
