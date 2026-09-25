import type { CardSide, ColourId } from './types'

/** A run of text that is all one colour (or uncoloured). */
export interface Segment {
  text: string
  colour: ColourId | null
}

/**
 * Turn plain text plus a list of colour ranges into runs ready to display.
 *
 * Works by colouring a character at a time and then grouping neighbours that
 * match. That is slower than merging ranges directly, but card text is a few
 * words long, and it means overlapping, out-of-order or out-of-range spans can
 * never produce a broken result. Where spans overlap, the last one wins.
 */
export function toSegments(side: CardSide): Segment[] {
  const { text, spans } = side
  if (text.length === 0) return []

  const colourAt: (ColourId | null)[] = new Array(text.length).fill(null)

  for (const span of spans) {
    const start = Math.max(0, Math.min(span.start, text.length))
    const end = Math.max(start, Math.min(span.end, text.length))
    for (let i = start; i < end; i++) colourAt[i] = span.colour
  }

  const segments: Segment[] = []
  for (let i = 0; i < text.length; i++) {
    const last = segments[segments.length - 1]
    if (last && last.colour === colourAt[i]) {
      last.text += text[i]
    } else {
      segments.push({ text: text[i], colour: colourAt[i] })
    }
  }
  return segments
}

/** Drop spans that are empty or point outside the text. */
export function tidySpans(side: CardSide): CardSide {
  return {
    text: side.text,
    spans: side.spans.filter((s) => s.start < s.end && s.start >= 0 && s.end <= side.text.length),
  }
}
