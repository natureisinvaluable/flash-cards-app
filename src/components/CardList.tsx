import type { AppData } from '../types'
import { sortedCategories } from '../storage'
import { ColouredText } from './ColouredText'

/**
 * Every card, grouped under its category.
 *
 * Stage 1 only displays. Editing, re-filing and search arrive in later stages.
 */
export function CardList({ data }: { data: AppData }) {
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
                    <p className="card-portuguese">
                      <ColouredText side={card.portuguese} />
                    </p>
                    <p className="card-english">
                      <ColouredText side={card.english} />
                    </p>
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
