import type { AppData, Card } from '../types'
import { sortedCategories } from '../storage'
import { ColouredText } from './ColouredText'

/** Every card, grouped under its category. */
export function CardList({ data, onEdit }: { data: AppData; onEdit: (card: Card) => void }) {
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
                  <li key={card.id}>
                    <button type="button" className="card" onClick={() => onEdit(card)}>
                      <span className="card-portuguese">
                        <ColouredText side={card.portuguese} />
                      </span>
                      <span className="card-english">
                        <ColouredText side={card.english} />
                      </span>
                    </button>
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
