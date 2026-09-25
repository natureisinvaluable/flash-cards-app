import { useState } from 'react'
import type { AppData } from '../types'
import { hasExampleCards, removeExampleCards, setColourMeaning } from '../storage'

/**
 * What the colours mean, and clearing out the example cards.
 *
 * Colour meanings are stored as editable labels rather than fixed text, so the
 * defaults (blue = masculine, and so on) are a starting point rather than a
 * rule the app imposes.
 */
export function SettingsPanel({
  data,
  update,
}: {
  data: AppData
  update: (change: (current: AppData) => AppData) => void
}) {
  const [confirmingRemove, setConfirmingRemove] = useState(false)
  const exampleCount = data.cards.filter((c) => c.isExample).length

  return (
    <section className="panel">
      <h2>Settings</h2>

      <h3>What the colours mean</h3>
      <p className="panel-intro">
        Rename any of these. They are only labels &mdash; use a colour however
        suits you.
      </p>

      <ul className="colour-settings">
        {data.colourMeanings.map((meaning) => (
          <li key={meaning.colour}>
            <span className={`swatch colour-${meaning.colour}`} aria-hidden="true" />
            <input
              type="text"
              value={meaning.label}
              aria-label={`What ${meaning.colour} means`}
              onChange={(event) =>
                update((current) => setColourMeaning(current, meaning.colour, event.target.value))
              }
            />
          </li>
        ))}
      </ul>

      {hasExampleCards(data) && (
        <>
          <h3>Example cards</h3>
          <p className="panel-intro">
            The app came with {exampleCount} example cards to show how it works.
            Remove them once you have your own.
          </p>
          {confirmingRemove ? (
            <div className="confirm" role="alertdialog" aria-label="Confirm removing examples">
              <p>
                <strong>Remove all {exampleCount} example cards?</strong> Your own
                cards are not affected. This cannot be undone.
              </p>
              <div className="button-row">
                <button
                  type="button"
                  className="danger"
                  onClick={() => {
                    update(removeExampleCards)
                    setConfirmingRemove(false)
                  }}
                >
                  Remove them
                </button>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => setConfirmingRemove(false)}
                >
                  Keep them
                </button>
              </div>
            </div>
          ) : (
            <button type="button" className="secondary" onClick={() => setConfirmingRemove(true)}>
              Remove example cards
            </button>
          )}
        </>
      )}
    </section>
  )
}
