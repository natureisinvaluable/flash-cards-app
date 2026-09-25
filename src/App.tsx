import { useState } from 'react'
import type { Card, CardSide } from './types'
import { useAppData } from './useAppData'
import { addCard, deleteCard, setCardCategory, updateCard } from './storage'
import { mergeData } from './merge'
import { CardList } from './components/CardList'
import { ColourLegend } from './components/ColourLegend'
import { BackupPanel } from './components/BackupPanel'
import { CardEditor } from './components/CardEditor'
import { CategoryManager } from './components/CategoryManager'
import { SettingsPanel } from './components/SettingsPanel'
import { Study } from './components/Study'

type Editing = { mode: 'new' } | { mode: 'edit'; card: Card } | null
type Panel = 'categories' | 'settings' | 'backup' | null

export default function App() {
  const { data, update, saveFailed } = useAppData()
  const [editing, setEditing] = useState<Editing>(null)
  const [panel, setPanel] = useState<Panel>(null)
  const [studying, setStudying] = useState(false)
  const [search, setSearch] = useState('')

  function togglePanel(which: Exclude<Panel, null>) {
    setPanel((open) => (open === which ? null : which))
  }

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
        <>
          <div className="button-row toolbar">
            <button
              type="button"
              onClick={() => setStudying(true)}
              disabled={data.cards.length === 0}
            >
              Study
            </button>
            <button
              type="button"
              className="secondary"
              onClick={() => setEditing({ mode: 'new' })}
            >
              Add a card
            </button>
            <button
              type="button"
              className="secondary"
              aria-expanded={panel === 'categories'}
              onClick={() => togglePanel('categories')}
            >
              Categories
            </button>
            <button
              type="button"
              className="secondary"
              aria-expanded={panel === 'settings'}
              onClick={() => togglePanel('settings')}
            >
              Settings
            </button>
            <button
              type="button"
              className="secondary"
              aria-expanded={panel === 'backup'}
              onClick={() => togglePanel('backup')}
            >
              Backup
            </button>
          </div>

          {panel === 'categories' && <CategoryManager data={data} update={update} />}
          {panel === 'settings' && <SettingsPanel data={data} update={update} />}
          {panel === 'backup' && (
            <BackupPanel
              data={data}
              onMerge={(incoming) => update((current) => mergeData(current, incoming).data)}
              onReplace={(incoming) => update(() => incoming)}
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
        </>
      )}

      <ColourLegend meanings={data.colourMeanings} />

      <CardList
        data={data}
        search={editing ? '' : search}
        onEdit={(card) => setEditing({ mode: 'edit', card })}
        onMove={(card, categoryId) =>
          update((current) => setCardCategory(current, card.id, categoryId))
        }
      />

      <p className="privacy-note">
        Your cards are stored on this device only. Nothing is sent anywhere.
      </p>
    </main>
  )
}
