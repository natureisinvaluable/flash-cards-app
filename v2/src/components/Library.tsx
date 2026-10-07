import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import type { Card, CardSide } from '../types'
import { useLibrary } from '../useLibrary'
import { CardLibrary } from './CardLibrary'
import { CategoryManager } from './CategoryManager'
import { CardEditor } from './CardEditor'
import { Study } from './Study'
import { SettingsPanel } from './SettingsPanel'
import { ImportPanel } from './ImportPanel'
import { ColourLegend } from './ColourLegend'

type Editing = { mode: 'new' } | { mode: 'edit'; card: Card } | null

/** The signed-in app: shared cards, arranged your way. */
export function Library({ session }: { session: Session }) {
  const library = useLibrary(session.user.id)
  const [panel, setPanel] = useState<'categories' | 'settings' | 'import' | null>(null)
  const [editing, setEditing] = useState<Editing>(null)
  const [saving, setSaving] = useState(false)
  const [studying, setStudying] = useState(false)
  const [search, setSearch] = useState('')

  /**
   * Start each screen at the top.
   *
   * Without this the browser keeps whatever scroll position the last screen
   * had. Saving a card leaves you part-way down a list of several hundred,
   * with the buttons far above - so adding two cards in a row means scrolling
   * the length of the collection in between.
   */
  const view = studying ? 'study' : editing ? 'edit' : 'list'
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [view])

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
      <>
        {library.offline && (
          <p className="notice offline-note" role="status">
            <strong>Offline.</strong> Study works, but how you file these cards
            will not be saved.
          </p>
        )}
        <Study
          cards={library.cards}
          categories={library.categories}
          states={library.states}
          onFile={library.fileCard}
          onViewed={library.markViewed}
          onExit={() => setStudying(false)}
        />
      </>
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
      {library.offline && (
        <p className="notice offline-note" role="status">
          <strong>You are offline.</strong> These are the cards as they were when
          you last had a connection
          {library.cachedAt && ` (${new Date(library.cachedAt).toLocaleString()})`}. You
          can study as normal, but anything you file or change will{' '}
          <strong>not be saved</strong>.
        </p>
      )}

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
          aria-expanded={panel === 'categories'}
          onClick={() => setPanel((open) => (open === 'categories' ? null : 'categories'))}
        >
          My categories
        </button>
        <button
          type="button"
          className="secondary"
          aria-expanded={panel === 'settings'}
          onClick={() => setPanel((open) => (open === 'settings' ? null : 'settings'))}
        >
          Settings
        </button>
        {library.profile?.isOwner && (
          <button
            type="button"
            className="secondary"
            aria-expanded={panel === 'import'}
            onClick={() => setPanel((open) => (open === 'import' ? null : 'import'))}
          >
            Import
          </button>
        )}
      </div>

      {panel === 'import' && library.profile?.isOwner && (
        <ImportPanel
          userId={session.user.id}
          cards={library.cards}
          categories={library.categories}
          onDone={library.refresh}
        />
      )}

      {panel === 'settings' && library.profile && (
        <SettingsPanel
          profile={library.profile}
          cards={library.cards}
          categories={library.categories}
          states={library.states}
          onSaved={library.refresh}
        />
      )}

      {panel === 'categories' && (
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
