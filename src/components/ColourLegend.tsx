import type { ColourMeaning } from '../types'

/** What each colour means. The labels are editable data, not fixed text. */
export function ColourLegend({ meanings }: { meanings: ColourMeaning[] }) {
  return (
    <ul className="legend">
      {meanings.map((meaning) => (
        <li key={meaning.colour}>
          <span className={`swatch colour-${meaning.colour}`} aria-hidden="true" />
          {meaning.label}
        </li>
      ))}
    </ul>
  )
}
