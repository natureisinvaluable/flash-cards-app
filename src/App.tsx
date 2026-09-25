import { useState } from 'react'
import type { Card, CardSide } from './types'
import { useAppData } from './useAppData'
import { addCard, deleteCard, setCardCategory, updateCard } from './storage'
import { CardList } from './components/CardList'
import { ColourLegend } from './components/ColourLegend'
import { BackupPanel } from './components/BackupPanel'
import { CardEditor } from './components/CardEditor'
import { CategoryManager } from './components/CategoryManager'
import { Study } from './components/Study'

type Editing = { mode: 'new' } | { mode: 'edit'; card: Card } | null

export default function App() {
  const { data, update, saveFailed } = useAppData()
  const [editing, setEditing] = useState<Editing>(null)
  const [showCategories, setShowCategories] = useState(false)
  const [studying, setStudying] = useState(false)

  function handleSave(english: CardSide, portuguese: CardSide, categoryId: string) {
    if (editing?.mode === 'edit') {
      update((current) =>
        updateCard(current, editing.card.id, { english, portuguese, categoryId }),
      )
    } else {
      update((current) => addCard(current, english, portuguese, categoryId))
    }
    setEditing(null)
  }

  function handleDelete() {
    if (editing?.mode !== 'edit') return
    update((current) => deleteCard(current, editing.card.id))
    setEditing(null)
  }

  if (studying) {
    return (
      <main className="shell">
        <Study
          data={data}
          onMove={(cardId, categoryId) =>
            update((current) => setCardCategory(current, cardId, categoryId))
          }
          onExit={() => setStudying(false)}
        />
      </main>
    )
  }

  return (
    <main className="shell">
      <header>
        <h1>Portuguese Flashcards</h1>
        <p className="tagline">European Portuguese &middot; a private study app</p>
      </header>

      {saveFailed && (
        <p className="notice warning" role="alert">
          <strong>Your changes are not being saved.</strong> This browser is
          refusing to store data, which can happen in a private window or if site
          data is blocked. Anything you add now will be lost when you close the tab.
        </p>
      )}

      {editing ? (
        <CardEditor
          // Remounts when switching cards, so the fields reload.
          key={editing.mode === 'edit' ? editing.card.id : 'new'}
          data={data}
          card={editing.mode === 'edit' ? editing.card : null}
          onSave={handleSave}
          onDelete={handleDelete}
          onCancel={() => setEditing(null)}
        />
      ) : (
        <div className="button-row toolbar">
          <button type="button" onClick={() => setStudying(true)} disabled={data.cards.length === 0}>
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
            {showCategories ? 'Hide categories' : 'Manage categories'}
          </button>
        </div>
      )}

      {showCategories && !editing && <CategoryManager data={data} update={update} />}

      <ColourLegend meanings={data.colourMeanings} />

      <CardList
        data={data}
        onEdit={(card) => setEditing({ mode: 'edit', card })}
        onMove={(card, categoryId) =>
          update((current) => setCardCategory(current, card.id, categoryId))
        }
      />

      <BackupPanel data={data} onRestore={(restored) => update(() => restored)} />

      <p className="privacy-note">
        Your cards are stored on this device only. Nothing is sent anywhere.
      </p>
    </main>
  )
}
