import { useState } from 'react'
import type { AppData } from '../types'
import {
  addCategory,
  countCardsIn,
  deleteCategory,
  moveCategory,
  renameCategory,
  sortedCategories,
} from '../storage'

/**
 * Rename, reorder, add and remove the confidence categories.
 *
 * Deleting is the only risky action here, so it always asks where the cards
 * should go, and the last remaining category cannot be removed - every card
 * has to live somewhere.
 */
export function CategoryManager({
  data,
  update,
}: {
  data: AppData
  update: (change: (current: AppData) => AppData) => void
}) {
  const categories = sortedCategories(data)
  const [newName, setNewName] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [moveCardsTo, setMoveCardsTo] = useState('')

  function startDeleting(id: string) {
    setDeleting(id)
    const firstOther = categories.find((c) => c.id !== id)
    setMoveCardsTo(firstOther ? firstOther.id : '')
  }

  function confirmDelete() {
    if (!deleting || !moveCardsTo) return
    update((current) => deleteCategory(current, deleting, moveCardsTo))
    setDeleting(null)
  }

  function handleAdd(event: React.FormEvent) {
    event.preventDefault()
    const name = newName.trim()
    if (!name) return
    update((current) => addCategory(current, name))
    setNewName('')
  }

  const isLastCategory = categories.length <= 1

  return (
    <section className="panel">
      <h2>Categories</h2>
      <p className="panel-intro">
        Rename these to suit you, change their order, or add your own.
      </p>

      <ul className="category-admin">
        {categories.map((category, index) => {
          const cardCount = countCardsIn(data, category.id)
          return (
            <li key={category.id}>
              <div className="category-admin-row">
                <input
                  type="text"
                  aria-label={`Name for ${category.name}`}
                  value={category.name}
                  onChange={(event) =>
                    update((current) => renameCategory(current, category.id, event.target.value))
                  }
                  onBlur={(event) => {
                    // A blank name would leave an unlabelled button in study
                    // mode, so give it something rather than allow nothing.
                    if (event.target.value.trim().length === 0) {
                      update((current) => renameCategory(current, category.id, 'Untitled'))
                    }
                  }}
                />
                <span className="count">{cardCount}</span>
                <button
                  type="button"
                  className="secondary small"
                  disabled={index === 0}
                  onClick={() => update((current) => moveCategory(current, category.id, -1))}
                  aria-label={`Move ${category.name} up`}
                  title="Move up"
                >
                  &uarr;
                </button>
                <button
                  type="button"
                  className="secondary small"
                  disabled={index === categories.length - 1}
                  onClick={() => update((current) => moveCategory(current, category.id, 1))}
                  aria-label={`Move ${category.name} down`}
                  title="Move down"
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
                      ? 'You need at least one category, so this one cannot be deleted'
                      : `Delete ${category.name}`
                  }
                >
                  Delete
                </button>
              </div>

              {deleting === category.id && (
                <div className="confirm" role="alertdialog" aria-label="Confirm category delete">
                  <p>
                    <strong>Delete &ldquo;{category.name}&rdquo;?</strong>
                  </p>
                  {cardCount > 0 ? (
                    <>
                      <p>
                        {cardCount} {cardCount === 1 ? 'card is' : 'cards are'} in it. Where should{' '}
                        {cardCount === 1 ? 'it' : 'they'} go?
                      </p>
                      <select
                        value={moveCardsTo}
                        aria-label="Move cards to"
                        onChange={(event) => setMoveCardsTo(event.target.value)}
                      >
                        {categories
                          .filter((c) => c.id !== category.id)
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.name}
                            </option>
                          ))}
                      </select>
                    </>
                  ) : (
                    <p>It has no cards in it, so nothing will be lost.</p>
                  )}
                  <div className="button-row">
                    <button type="button" className="danger" onClick={confirmDelete}>
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

      <form className="add-category" onSubmit={handleAdd}>
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
