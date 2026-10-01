import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Card, CardSide } from '../types'
import { useLibrary } from '../useLibrary'
import { CardLibrary } from './CardLibrary'
import { CategoryManager } from './CategoryManager'
import { CardEditor } from './CardEditor'
import { Study } from './Study'
import { ColourLegend } from './ColourLegend'

type Editing = { mode: 'new' } | { mode: 'edit'; card: Card } | null

/** The signed-in app: shared cards, arranged your way. */
export function Library({ session }: { session: Session }) {
  const library = useLibrary(session.user.id)
  const [showCategories, setShowCategories] = useState(false)
  const [editing, setEditing] = useState<Editing>(null)
  const [saving, setSaving] = useState(false)
  const [studying, setStudying] = useState(false)
  const [search, setSearch] = useState('')

  if (library.loading) return <p className="hint">Loading&hellip;</p>

  const colourMeanings = library.profile?.colourMeanings ?? []

  async function handleDelete() {
    if (editing?.mode !== 'edit') return
    setSaving(true)
    try {
      await library.removeCard(editing.card.id)
      setEditing(null)
    } catch (e) {
      // Surfaced rather than swallowed: if the database refused, the person
      // needs to know the card is still there.
      window.alert((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  async function handleSave(english: CardSide, portuguese: CardSide, categoryId: string | null) {
    setSaving(true)
    try {
      await library.saveCard(editing?.mode === 'edit' ? editing.card : null, english, portuguese, categoryId)
      setEditing(null)
    } finally {
      setSaving(false)
    }
  }

  if (studying) {
    return (
      <Study
        cards={library.cards}
        categories={library.categories}
        states={library.states}
        onFile={library.fileCard}
        onViewed={library.markViewed}
        onExit={() => setStudying(false)}
      />
    )
  }

  if (editing) {
    return (
      <CardEditor
        key={editing.mode === 'edit' ? editing.card.id : 'new'}
        card={editing.mode === 'edit' ? editing.card : null}
        categories={library.categories}
        colourMeanings={colourMeanings}
        currentCategoryId={
          editing.mode === 'edit' ? (library.states[editing.card.id]?.categoryId ?? null) : null
        }
        isOwner={library.profile?.isOwner ?? false}
        onSave={handleSave}
        onDelete={handleDelete}
        onCancel={() => setEditing(null)}
        saving={saving}
      />
    )
  }

  return (
    <>
      {library.error && (
        <p className="notice warning" role="alert">
          {library.error}{' '}
          <button type="button" className="secondary small" onClick={library.dismissError}>
            Dismiss
          </button>
        </p>
      )}

      <div className="button-row toolbar">
        <button type="button" onClick={() => setStudying(true)} disabled={library.cards.length === 0}>
          Study
        </button>
        <button type="button" className="secondary" onClick={() => setEditing({ mode: 'new' })}>
          Add a card
        </button>
        <button
          type="button"
          className="secondary"
          aria-expanded={showCategories}
          onClick={() => setShowCategories((shown) => !shown)}
        >
          {showCategories ? 'Hide categories' : 'My categories'}
        </button>
      </div>

      {showCategories && (
        <CategoryManager
          categories={library.categories}
          cards={library.cards}
          states={library.states}
          onRename={library.rename}
          onMove={library.move}
          onAdd={library.createCategory}
          onDelete={library.remove}
        />
      )}

      <div className="search-field">
        <label className="field-label" htmlFor="search">
          Search
        </label>
        <input
          id="search"
          type="search"
          value={search}
          placeholder="English or Portuguese&hellip;"
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <ColourLegend meanings={colourMeanings} />

      <CardLibrary
        cards={library.cards}
        categories={library.categories}
        states={library.states}
        search={search}
        onFile={library.fileCard}
        onEdit={(card) => setEditing({ mode: 'edit', card })}
      />
    </>
  )
}
