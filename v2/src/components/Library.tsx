import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Card, CardSide } from '../types'
import { useLibrary } from '../useLibrary'
import { CardLibrary } from './CardLibrary'
import { CategoryManager } from './CategoryManager'
import { CardEditor } from './CardEditor'
import { ColourLegend } from './ColourLegend'

type Editing = { mode: 'new' } | { mode: 'edit'; card: Card } | null

/** The signed-in app: shared cards, arranged your way. */
export function Library({ session }: { session: Session }) {
  const library = useLibrary(session.user.id)
  const [showCategories, setShowCategories] = useState(false)
  const [editing, setEditing] = useState<Editing>(null)
  const [saving, setSaving] = useState(false)

  if (library.loading) return <p className="hint">Loading&hellip;</p>

  const colourMeanings = library.profile?.colourMeanings ?? []

  async function handleSave(english: CardSide, portuguese: CardSide, categoryId: string | null) {
    setSaving(true)
    try {
      await library.saveCard(editing?.mode === 'edit' ? editing.card : null, english, portuguese, categoryId)
      setEditing(null)
    } finally {
      setSaving(false)
    }
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
        onSave={handleSave}
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
        <button type="button" onClick={() => setEditing({ mode: 'new' })}>
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

      <ColourLegend meanings={colourMeanings} />

      <CardLibrary
        cards={library.cards}
        categories={library.categories}
        states={library.states}
        onFile={library.fileCard}
        onEdit={(card) => setEditing({ mode: 'edit', card })}
      />
    </>
  )
}
