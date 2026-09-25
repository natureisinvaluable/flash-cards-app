import { useState } from 'react'
import type { AppData, Card, CardSide } from '../types'
import { emptySide } from '../colour'
import { sortedCategories } from '../storage'
import { SideEditor } from './SideEditor'

/** Accented characters that are awkward to type on a UK keyboard. */
const PORTUGUESE_ACCENTS = ['á', 'â', 'ã', 'à', 'ç', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú']

export function CardEditor({
  data,
  card,
  onSave,
  onDelete,
  onCancel,
}: {
  data: AppData
  /** The card being changed, or null when adding a new one. */
  card: Card | null
  onSave: (english: CardSide, portuguese: CardSide, categoryId: string) => void
  onDelete: () => void
  onCancel: () => void
}) {
  const categories = sortedCategories(data)

  const [english, setEnglish] = useState<CardSide>(card?.english ?? emptySide())
  const [portuguese, setPortuguese] = useState<CardSide>(card?.portuguese ?? emptySide())
  const [categoryId, setCategoryId] = useState(card?.categoryId ?? categories[0].id)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const ready = english.text.trim().length > 0 && portuguese.text.trim().length > 0

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!ready) return
    onSave(english, portuguese, categoryId)
  }

  return (
    <form className="panel editor" onSubmit={handleSubmit}>
      <h2>{card ? 'Edit card' : 'New card'}</h2>

      <SideEditor label="English" side={english} meanings={data.colourMeanings} onChange={setEnglish} />

      <SideEditor
        label="Portuguese"
        side={portuguese}
        meanings={data.colourMeanings}
        accents={PORTUGUESE_ACCENTS}
        onChange={setPortuguese}
      />

      <div className="field">
        <label className="field-label" htmlFor="card-category">
          How well do you know it?
        </label>
        <select
          id="card-category"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
        >
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div className="button-row">
        <button type="submit" disabled={!ready}>
          {card ? 'Save changes' : 'Add card'}
        </button>
        <button type="button" className="secondary" onClick={onCancel}>
          Cancel
        </button>
        {card && (
          <button type="button" className="danger" onClick={() => setConfirmingDelete(true)}>
            Delete
          </button>
        )}
      </div>

      {!ready && (
        <p className="hint">Both sides need some words before the card can be saved.</p>
      )}

      {confirmingDelete && card && (
        <div className="confirm" role="alertdialog" aria-label="Confirm delete">
          <p>
            <strong>Delete &ldquo;{card.portuguese.text}&rdquo;?</strong> This cannot be undone.
          </p>
          <div className="button-row">
            <button type="button" className="danger" onClick={onDelete}>
              Yes, delete it
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setConfirmingDelete(false)}
            >
              Keep it
            </button>
          </div>
        </div>
      )}
    </form>
  )
}
