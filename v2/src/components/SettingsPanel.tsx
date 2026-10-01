import { useEffect, useState } from 'react'
import type { ColourMeaning, Member, Profile } from '../profile'
import { fetchMembers, updateColourMeanings, updateDisplayName } from '../profile'

/**
 * Your own settings: what the colours mean to you, and what you are called.
 *
 * Both are personal. Renaming a colour changes nothing for anyone else, which
 * is the point - one person may use orange for irregular verbs and another for
 * words they keep forgetting.
 *
 * Saving happens when a field loses focus rather than on every keystroke. In
 * v1 that distinction did not matter because saving was instant and local;
 * here every save is a request across the internet.
 */
export function SettingsPanel({ profile, onSaved }: { profile: Profile; onSaved: () => void }) {
  const [name, setName] = useState(profile.displayName)
  const [meanings, setMeanings] = useState<ColourMeaning[]>(profile.colourMeanings)
  const [members, setMembers] = useState<Member[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    fetchMembers()
      .then(setMembers)
      .catch(() => setMembers([]))
  }, [])

  function flashSaved() {
    setSaved(true)
    setError(null)
    onSaved()
    window.setTimeout(() => setSaved(false), 1500)
  }

  async function saveName() {
    const trimmed = name.trim()
    if (trimmed === profile.displayName) return
    try {
      await updateDisplayName(profile.id, trimmed)
      flashSaved()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  async function saveMeanings(next: ColourMeaning[]) {
    try {
      await updateColourMeanings(profile.id, next)
      flashSaved()
    } catch (e) {
      setError((e as Error).message)
    }
  }

  return (
    <section className="panel">
      <h2>Settings</h2>

      {error && (
        <p className="notice warning" role="alert">
          {error}
        </p>
      )}
      {saved && <p className="notice success">Saved.</p>}

      <h3>Your name</h3>
      <p className="panel-intro">How you appear to the others sharing these cards.</p>
      <input
        type="text"
        value={name}
        aria-label="Your display name"
        onChange={(event) => setName(event.target.value)}
        onBlur={saveName}
      />

      <h3>What the colours mean</h3>
      <p className="panel-intro">
        Yours alone. Rename any of them &mdash; they are only labels, and nobody
        else&rsquo;s legend changes.
      </p>
      <ul className="colour-settings">
        {meanings.map((meaning, index) => (
          <li key={meaning.colour}>
            <span className={`swatch colour-${meaning.colour}`} aria-hidden="true" />
            <input
              type="text"
              value={meaning.label}
              aria-label={`What ${meaning.colour} means`}
              onChange={(event) => {
                const next = [...meanings]
                next[index] = { ...meaning, label: event.target.value }
                setMeanings(next)
              }}
              onBlur={() => saveMeanings(meanings)}
            />
          </li>
        ))}
      </ul>

      <h3>Who else is here</h3>
      {members === null ? (
        <p className="hint">Loading&hellip;</p>
      ) : (
        <ul className="member-list">
          {members.map((member) => (
            <li key={member.id}>
              {member.displayName || <em>unnamed</em>}
              {member.isOwner && <span className="current-tag">owner</span>}
              {member.id === profile.id && <span className="hint"> &mdash; you</span>}
            </li>
          ))}
        </ul>
      )}
      <p className="hint">
        Everyone here shares the same cards. Invite someone from the Supabase
        dashboard, under Authentication &rarr; Users.
      </p>
    </section>
  )
}
