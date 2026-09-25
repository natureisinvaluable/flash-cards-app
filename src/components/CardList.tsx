import type { AppData, Card } from '../types'
import { sortedCategories } from '../storage'
import { ColouredText } from './ColouredText'

/**
 * Every card, grouped under its category.
 *
 * Each card shows the other categories as buttons, so re-filing a card is one
 * tap rather than opening the editor.
 */
export function CardList({
  data,
  onEdit,
  onMove,
}: {
  data: AppData
  onEdit: (card: Card) => void
  onMove: (card: Card, categoryId: string) => void
}) {
  const categories = sortedCategories(data)

  return (
    <div>
      {categories.map((category) => {
        const cards = data.cards.filter((c) => c.categoryId === category.id)
        return (
          <section key={category.id} className="category">
            <h2>
              {category.name} <span className="count">{cards.length}</span>
            </h2>

            {cards.length === 0 ? (
              <p className="empty">No cards here yet.</p>
            ) : (
              <ul className="card-grid">
                {cards.map((card) => (
                  <li key={card.id} className="card">
                    <button
                      type="button"
                      className="card-open"
                      onClick={() => onEdit(card)}
                      title="Edit this card"
                    >
                      <span className="card-portuguese">
                        <ColouredText side={card.portuguese} />
                      </span>
                      <span className="card-english">
                        <ColouredText side={card.english} />
                      </span>
                    </button>

                    <div className="move-row">
                      {categories
                        .filter((c) => c.id !== card.categoryId)
                        .map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className="move-chip"
                            onClick={() => onMove(card, c.id)}
                            title={`Move to ${c.name}`}
                          >
                            {c.name}
                          </button>
                        ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )
      })}
    </div>
  )
}
