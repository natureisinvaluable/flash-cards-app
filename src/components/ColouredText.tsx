import type { CardSide } from '../types'
import { toSegments } from '../colour'

/** Displays a card side with its coloured words. */
export function ColouredText({ side }: { side: CardSide }) {
  return (
    <>
      {toSegments(side).map((segment, i) =>
        segment.colour ? (
          <span key={i} className={`colour-${segment.colour}`}>
            {segment.text}
          </span>
        ) : (
          <span key={i}>{segment.text}</span>
        ),
      )}
    </>
  )
}
