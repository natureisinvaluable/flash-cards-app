import type { Card, CardState, Category } from '../types'
import { cardMatches } from '../search'
import { ColouredText } from './ColouredText'

/** The unsorted bucket. Not a real category - the absence of one. */
const UNSORTED = {
  id: null,
  name: 'New',
  note: 'Cards nobody has filed for you yet. Tap a category to file one.',
}

/**
 * The shared cards, grouped by YOUR categories.
 *
 * Everyone sees the same cards here, but this arrangement is yours: the same
 * card can sit under "Know well" for you and "Don't know" for a friend.
 */
export function CardLibrary({
  cards,
  categories,
  states,
  search,
  onFile,
  onEdit,
}: {
  cards: Card[]
  categories: Category[]
  states: Record<string, CardState>
  search: string
  onFile: (cardId: string, categoryId: string | null) => void
  onEdit: (card: Card) => void
}) {
  const categoryOf = (card: Card): string | null => states[card.id]?.categoryId ?? null

  const isSearching = search.trim().length > 0
  const matching = cards.filter((card) => cardMatches(card, search))

  if (isSearching && matching.length === 0) {
    return (
      <p className="empty">
        No cards match &ldquo;{search.trim()}&rdquo;. Searching ignores accents, so{' '}
        <em>cao</em> will find <em>c&atilde;o</em>.
      </p>
    )
  }

  const groups: { id: string | null; name: string; note?: string; cards: Card[] }[] = [
    { ...UNSORTED, cards: matching.filter((c) => categoryOf(c) === null) },
    ...categories.map((category) => ({
      id: category.id as string | null,
      name: category.name,
      cards: matching.filter((c) => categoryOf(c) === category.id),
    })),
  ]

  return (
    <div>
      {isSearching && (
        <p className="search-summary">
          {matching.length} {matching.length === 1 ? 'card matches' : 'cards match'} &ldquo;
          {search.trim()}&rdquo;
        </p>
      )}

      {groups.map((group) => {
        // An empty New bucket means everything is filed, which is worth not
        // cluttering the page with.
        if (group.id === null && group.cards.length === 0) return null

        // While searching, skip categories with no matches rather than
        // padding the results with empty headings.
        if (isSearching && group.cards.length === 0) return null

        return (
          <section key={group.id ?? 'unsorted'} className="category">
            <h2>
              {group.name} <span className="count">{group.cards.length}</span>
            </h2>
            {group.note && group.cards.length > 0 && <p className="hint pool-note">{group.note}</p>}

            {group.cards.length === 0 ? (
              <p className="empty">Nothing filed here yet.</p>
            ) : (
              <ul className="card-grid">
                {group.cards.map((card) => (
                  <li key={card.id} className="card">
                    <button
                      type="button"
                      className="card-open"
                      onClick={() => onEdit(card)}
                      title="Correct this card"
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
                        .filter((c) => c.id !== group.id)
                        .map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            className="move-chip"
                            onClick={() => onFile(card.id, c.id)}
                            title={`File under ${c.name}`}
                          >
                            {c.name}
                          </button>
                        ))}
                      {group.id !== null && (
                        <button
                          type="button"
                          className="move-chip"
                          onClick={() => onFile(card.id, null)}
                          title="Put this card back to unsorted"
                        >
                          Unfile
                        </button>
                      )}
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
