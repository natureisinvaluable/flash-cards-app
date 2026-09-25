import { useEffect, useRef, useState } from 'react'
import type { CardSide, ColourId, ColourMeaning } from '../types'
import { applyColour, replaceRange, setText } from '../colour'
import { ColouredText } from './ColouredText'

interface Selection {
  start: number
  end: number
}

/**
 * One face of a card: the words, the colour tools, and a live preview.
 *
 * Colouring works on whatever is selected in the text box. The swatches use
 * onMouseDown/preventDefault so that clicking one does not clear the selection
 * before we can read it - without that, colouring never works at all.
 */
export function SideEditor({
  label,
  side,
  meanings,
  accents,
  onChange,
}: {
  label: string
  side: CardSide
  meanings: ColourMeaning[]
  accents?: string[]
  onChange: (side: CardSide) => void
}) {
  const textarea = useRef<HTMLTextAreaElement>(null)
  const [selection, setSelection] = useState<Selection>({ start: 0, end: 0 })

  // Where the cursor should end up after a colour or accent button is used.
  const restoreTo = useRef<Selection | null>(null)

  useEffect(() => {
    const element = textarea.current
    const wanted = restoreTo.current
    if (!element || !wanted) return
    restoreTo.current = null
    element.focus()
    element.setSelectionRange(wanted.start, wanted.end)
    setSelection(wanted)
  })

  function trackSelection() {
    const element = textarea.current
    if (element) setSelection({ start: element.selectionStart, end: element.selectionEnd })
  }

  const hasSelection = selection.end > selection.start

  function colourSelection(colour: ColourId | null) {
    if (!hasSelection) return
    onChange(applyColour(side, selection.start, selection.end, colour))
    restoreTo.current = selection
  }

  function insertAccent(character: string) {
    onChange(replaceRange(side, selection.start, selection.end, character))
    const caret = selection.start + character.length
    restoreTo.current = { start: caret, end: caret }
  }

  return (
    <div className="side-editor">
      <label className="field-label" htmlFor={`side-${label}`}>
        {label}
      </label>

      <textarea
        id={`side-${label}`}
        ref={textarea}
        value={side.text}
        rows={2}
        onChange={(event) => onChange(setText(side, event.target.value))}
        onSelect={trackSelection}
        onKeyUp={trackSelection}
        onMouseUp={trackSelection}
        onFocus={trackSelection}
      />

      {accents && (
        <div className="accent-row">
          {accents.map((character) => (
            <button
              key={character}
              type="button"
              className="accent"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => insertAccent(character)}
              title={`Insert ${character}`}
            >
              {character}
            </button>
          ))}
        </div>
      )}

      <div className="colour-row">
        {meanings.map((meaning) => (
          <button
            key={meaning.colour}
            type="button"
            className={`swatch-button colour-${meaning.colour}`}
            disabled={!hasSelection}
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => colourSelection(meaning.colour)}
            title={meaning.label}
          >
            <span className="swatch" aria-hidden="true" />
            <span className="swatch-label">{meaning.label}</span>
          </button>
        ))}
        <button
          type="button"
          className="secondary small"
          disabled={!hasSelection}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => colourSelection(null)}
        >
          Remove colour
        </button>
      </div>

      <p className="hint">
        {hasSelection
          ? 'Now choose a colour for the selected words.'
          : 'Select some words above to colour them.'}
      </p>

      {side.text.length > 0 && (
        <p className="preview">
          <ColouredText side={side} />
        </p>
      )}
    </div>
  )
}
