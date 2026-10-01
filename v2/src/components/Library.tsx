import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { useLibrary } from '../useLibrary'
import { CardLibrary } from './CardLibrary'
import { CategoryManager } from './CategoryManager'

/** The signed-in app: shared cards, arranged your way. */
export function Library({ session }: { session: Session }) {
  const library = useLibrary(session.user.id)
  const [showCategories, setShowCategories] = useState(false)

  if (library.loading) return <p className="hint">Loading&hellip;</p>

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

      <CardLibrary
        cards={library.cards}
        categories={library.categories}
        states={library.states}
        onFile={library.fileCard}
      />
    </>
  )
}
