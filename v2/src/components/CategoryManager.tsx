import { useState } from 'react'
import type { Card, CardState, Category } from '../types'

/**
 * Renaming, reordering, adding and removing your own categories.
 *
 * These belong to you. Renaming "Know well" changes nothing for anyone else,
 * and nobody else can see what you have called yours.
 */
export function CategoryManager({
  categories,
  cards,
  states,
  onRename,
  onMove,
  onAdd,
  onDelete,
}: {
  categories: Category[]
  cards: Card[]
  states: Record<string, CardState>
  onRename: (id: string, name: string) => void
  onMove: (id: string, direction: -1 | 1) => void
  onAdd: (name: string) => void
  onDelete: (id: string, moveCardsTo: string | null) => void
}) {
  const [newName, setNewName] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [moveCardsTo, setMoveCardsTo] = useState<string>('')

  const countIn = (categoryId: string) =>
    cards.filter((card) => states[card.id]?.categoryId === categoryId).length

  const isLastCategory = categories.length <= 1

  function startDeleting(id: string) {
    setDeleting(id)
    setMoveCardsTo('') // empty means "leave them unsorted"
  }

  return (
    <section className="panel">
      <h2>Your categories</h2>
      <p className="panel-intro">
        These are yours alone. Rename them, reorder them or add your own &mdash;
        nobody else is affected.
      </p>

      <ul className="category-admin">
        {categories.map((category, index) => {
          const cardCount = countIn(category.id)
          return (
            <li key={category.id}>
              <div className="category-admin-row">
                <input
                  type="text"
                  aria-label={`Name for ${category.name}`}
                  value={category.name}
                  onChange={(event) => onRename(category.id, event.target.value)}
                  onBlur={(event) => {
                    // A blank name would leave an unlabelled button elsewhere.
                    if (event.target.value.trim().length === 0) onRename(category.id, 'Untitled')
                  }}
                />
                <span className="count">{cardCount}</span>
                <button
                  type="button"
                  className="secondary small"
                  disabled={index === 0}
                  onClick={() => onMove(category.id, -1)}
                  aria-label={`Move ${category.name} up`}
                >
                  &uarr;
                </button>
                <button
                  type="button"
                  className="secondary small"
                  disabled={index === categories.length - 1}
                  onClick={() => onMove(category.id, 1)}
                  aria-label={`Move ${category.name} down`}
                >
                  &darr;
                </button>
                <button
                  type="button"
                  className="secondary small"
                  disabled={isLastCategory}
                  onClick={() => startDeleting(category.id)}
                  title={
                    isLastCategory
                      ? 'You need at least one category to file cards into'
                      : `Delete ${category.name}`
                  }
                >
                  Delete
                </button>
              </div>

              {deleting === category.id && (
                <div className="confirm" role="alertdialog" aria-label="Confirm category delete">
                  <p>
                    <strong>Delete &ldquo;{category.name}&rdquo;?</strong> The cards
                    themselves are shared and are not deleted &mdash; only your
                    filing of them changes.
                  </p>
                  {cardCount > 0 && (
                    <>
                      <p>
                        {cardCount} {cardCount === 1 ? 'card is' : 'cards are'} filed
                        here. Where should {cardCount === 1 ? 'it' : 'they'} go?
                      </p>
                      <select
                        value={moveCardsTo}
                        aria-label="Move cards to"
                        onChange={(event) => setMoveCardsTo(event.target.value)}
                      >
                        <option value="">Leave them unsorted</option>
                        {categories
                          .filter((c) => c.id !== category.id)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                    </>
                  )}
                  <div className="button-row">
                    <button
                      type="button"
                      className="danger"
                      onClick={() => {
                        onDelete(category.id, moveCardsTo === '' ? null : moveCardsTo)
                        setDeleting(null)
                      }}
                    >
                      Delete the category
                    </button>
                    <button type="button" className="secondary" onClick={() => setDeleting(null)}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </li>
          )
        })}
      </ul>

      <form
        className="add-category"
        onSubmit={(event) => {
          event.preventDefault()
          const name = newName.trim()
          if (!name) return
          onAdd(name)
          setNewName('')
        }}
      >
        <input
          type="text"
          value={newName}
          placeholder="New category name"
          aria-label="New category name"
          onChange={(event) => setNewName(event.target.value)}
        />
        <button type="submit" disabled={newName.trim().length === 0}>
          Add
        </button>
      </form>
    </section>
  )
}
