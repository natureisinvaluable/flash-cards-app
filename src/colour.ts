import type { CardSide, ColourId, ColourSpan } from './types'

/** A run of text that is all one colour (or uncoloured). */
export interface Segment {
  text: string
  colour: ColourId | null
}

/**
 * Colour ranges are stored as positions in the text ("characters 4 to 8 are
 * blue"). Working with ranges directly is fiddly: they can overlap, nest, or
 * be split in half by an edit.
 *
 * So everything here goes via one representation - a colour per character -
 * and rebuilds tidy ranges at the end. Card text is a few words long, so the
 * cost is irrelevant and it removes a whole class of edge cases.
 */
function charColours(side: CardSide): (ColourId | null)[] {
  const colours: (ColourId | null)[] = new Array(side.text.length).fill(null)
  for (const span of side.spans) {
    const start = Math.max(0, Math.min(span.start, side.text.length))
    const end = Math.max(start, Math.min(span.end, side.text.length))
    for (let i = start; i < end; i++) colours[i] = span.colour
  }
  return colours
}

function spansFromChars(colours: (ColourId | null)[]): ColourSpan[] {
  const spans: ColourSpan[] = []
  for (let i = 0; i < colours.length; i++) {
    const colour = colours[i]
    if (colour === null) continue
    const last = spans[spans.length - 1]
    if (last && last.colour === colour && last.end === i) {
      last.end = i + 1
    } else {
      spans.push({ start: i, end: i + 1, colour })
    }
  }
  return spans
}

/** Break a side into runs ready to display. */
export function toSegments(side: CardSide): Segment[] {
  const colours = charColours(side)
  const segments: Segment[] = []
  for (let i = 0; i < side.text.length; i++) {
    const last = segments[segments.length - 1]
    if (last && last.colour === colours[i]) {
      last.text += side.text[i]
    } else {
      segments.push({ text: side.text[i], colour: colours[i] })
    }
  }
  return segments
}

/** Colour a selected stretch of text, or clear it by passing null. */
export function applyColour(
  side: CardSide,
  start: number,
  end: number,
  colour: ColourId | null,
): CardSide {
  const from = Math.max(0, Math.min(start, side.text.length))
  const to = Math.max(from, Math.min(end, side.text.length))
  if (from === to) return side

  const colours = charColours(side)
  for (let i = from; i < to; i++) colours[i] = colour
  return { text: side.text, spans: spansFromChars(colours) }
}

/**
 * Move colours across when the text itself is edited.
 *
 * The rule, from CLAUDE.md: colours on untouched text survive, and a colour
 * overlapping rewritten text is DROPPED rather than silently landing on the
 * wrong word. A missing colour is obvious and re-appliable; a colour on the
 * wrong letter would teach the wrong thing.
 *
 * The exception is an edit that falls STRICTLY INSIDE a coloured stretch,
 * leaving its first and last characters untouched - typing or fixing an accent
 * in an already-coloured word. The colour plainly still belongs to that word,
 * so it stays and stretches. This matters in Portuguese, where correcting
 * 'dificil' to 'dificil' with an accent is an everyday edit.
 */
export function remapSpans(oldText: string, newText: string, spans: ColourSpan[]): ColourSpan[] {
  if (oldText === newText) return spans

  // How much of the start and end of the text is unchanged.
  const maxShared = Math.min(oldText.length, newText.length)
  let prefix = 0
  while (prefix < maxShared && oldText[prefix] === newText[prefix]) prefix++
  let suffix = 0
  while (
    suffix < maxShared - prefix &&
    oldText[oldText.length - 1 - suffix] === newText[newText.length - 1 - suffix]
  ) {
    suffix++
  }

  const delta = newText.length - oldText.length
  const changedStart = prefix
  const changedEnd = oldText.length - suffix // exclusive, in the old text
  const moved: ColourSpan[] = []
  for (const span of spans) {
    if (span.end <= changedStart) {
      moved.push(span) // entirely before the edit
    } else if (span.start >= changedEnd) {
      moved.push({ ...span, start: span.start + delta, end: span.end + delta })
    } else if (span.start < changedStart && changedEnd < span.end) {
      moved.push({ ...span, end: span.end + delta }) // edited strictly inside it
    }
    // otherwise it overlapped rewritten text, so it is dropped
  }

  return moved.filter((s) => s.start < s.end && s.start >= 0 && s.end <= newText.length)
}

/** Replace the selected stretch with new text, keeping colours in step. */
export function replaceRange(side: CardSide, start: number, end: number, insert: string): CardSide {
  const text = side.text.slice(0, start) + insert + side.text.slice(end)
  return { text, spans: remapSpans(side.text, text, side.spans) }
}

/** Update the text wholesale (a textarea edit), keeping colours in step. */
export function setText(side: CardSide, text: string): CardSide {
  return { text, spans: remapSpans(side.text, text, side.spans) }
}

export const emptySide = (): CardSide => ({ text: '', spans: [] })
