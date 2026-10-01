import { useState } from 'react'
import type { Card, CardSide, Category } from '../types'
import type { ColourMeaning } from '../profile'
import { emptySide } from '../colour'
import { SideEditor } from './SideEditor'

/** Accented characters that are awkward to type on a UK keyboard. */
const PORTUGUESE_ACCENTS = ['á', 'â', 'ã', 'à', 'ç', 'é', 'ê', 'í', 'ó', 'ô', 'õ', 'ú']

const UNSORTED = ''

/**
 * Adding a card, or correcting one.
 *
 * Two things differ from v1 and both are said out loud on the screen rather
 * than left to be discovered: the card itself is shared, so an edit changes it
 * for everyone; and the category chosen here is only the creator's own filing,
 * which nobody else inherits.
 */
export function CardEditor({
  card,
  categories,
  colourMeanings,
  currentCategoryId,
  onSave,
  onCancel,
  saving,
}: {
  /** The card being corrected, or null when adding a new one. */
  card: Card | null
  categories: Category[]
  colourMeanings: ColourMeaning[]
  /** Where this card currently sits for you, if anywhere. */
  currentCategoryId: string | null
  onSave: (english: CardSide, portuguese: CardSide, categoryId: string | null) => void
  onCancel: () => void
  saving: boolean
}) {
  const [english, setEnglish] = useState<CardSide>(card?.english ?? emptySide())
  const [portuguese, setPortuguese] = useState<CardSide>(card?.portuguese ?? emptySide())
  const [categoryId, setCategoryId] = useState<string>(
    currentCategoryId ?? categories[0]?.id ?? UNSORTED,
  )

  const ready = english.text.trim().length > 0 && portuguese.text.trim().length > 0

  return (
    <form
      className="panel editor"
      onSubmit={(event) => {
        event.preventDefault()
        if (!ready || saving) return
        onSave(english, portuguese, categoryId === UNSORTED ? null : categoryId)
      }}
    >
      <h2>{card ? 'Correct this card' : 'New card'}</h2>

      {card && (
        <p className="notice shared-warning">
          This card is shared. Your corrections change it for everyone.
        </p>
      )}

      <SideEditor label="English" side={english} meanings={colourMeanings} onChange={setEnglish} />

      <SideEditor
        label="Portuguese"
        side={portuguese}
        meanings={colourMeanings}
        accents={PORTUGUESE_ACCENTS}
        onChange={setPortuguese}
      />

      <div className="field">
        <label className="field-label" htmlFor="card-category">
          How well do <em>you</em> know it?
        </label>
        <select
          id="card-category"
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
        >
          <option value={UNSORTED}>Leave it unsorted</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
        <p className="hint">
          This is your own filing only. Everyone else sees the card as new until
          they judge it themselves.
        </p>
      </div>

      <div className="button-row">
        <button type="submit" disabled={!ready || saving}>
          {saving ? 'Saving…' : card ? 'Save changes' : 'Add to the shared cards'}
        </button>
        <button type="button" className="secondary" onClick={onCancel} disabled={saving}>
          Cancel
        </button>
      </div>

      {!ready && <p className="hint">Both sides need some words before the card can be saved.</p>}
    </form>
  )
}
