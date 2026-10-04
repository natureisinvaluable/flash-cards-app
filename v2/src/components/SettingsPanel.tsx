import { useEffect, useState } from 'react'
import type { Card, CardState, Category } from '../types'
import type { ColourMeaning, Member, Profile } from '../profile'
import { fetchMembers, updateColourMeanings, updateDisplayName } from '../profile'
import { downloadBackup } from '../backup'
import { supabase } from '../supabase'
import { makeTransferCode } from '../signInToken'

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
export function SettingsPanel({
  profile,
  cards,
  categories,
  states,
  onSaved,
}: {
  profile: Profile
  cards: Card[]
  categories: Category[]
  states: Record<string, CardState>
  onSaved: () => void
}) {
  const [name, setName] = useState(profile.displayName)
  const [meanings, setMeanings] = useState<ColourMeaning[]>(profile.colourMeanings)
  const [members, setMembers] = useState<Member[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(false)
  const [transfer, setTransfer] = useState<string | null>(null)

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

      <h3>Save a copy</h3>
      <p className="panel-intro">
        The shared cards live in one database on the internet, and this file is
        the only copy that lives anywhere else. It holds every card, filed the
        way <em>you</em> have filed it.
      </p>
      <div className="button-row">
        <button
          type="button"
          onClick={() => downloadBackup(cards, categories, states, profile.colourMeanings)}
        >
          Download a copy of everything
        </button>
      </div>
      <p className="hint">
        The file is in version 1&rsquo;s format, so it can also be opened there
        &mdash; version 1 runs entirely in your browser and needs no database at
        all. These cards are not trapped in here.
      </p>

      <h3>Sign in on another device</h3>
      <p className="panel-intro">
        For getting into the app on a phone home screen, where a link opened in
        the browser cannot sign you in. Copy this, paste it into the sign-in box
        there, and you are in.
      </p>
      {transfer === null ? (
        <button
          type="button"
          className="secondary"
          onClick={async () => {
            const { data } = await supabase.auth.getSession()
            if (data.session) {
              setTransfer(makeTransferCode(data.session.access_token, data.session.refresh_token))
            } else {
              setError('Could not read your session.')
            }
          }}
        >
          Show my transfer code
        </button>
      ) : (
        <>
          <textarea
            readOnly
            rows={3}
            value={transfer}
            aria-label="Transfer code"
            onFocus={(event) => event.currentTarget.select()}
          />
          <p className="notice warning">
            <strong>Treat this like a password.</strong> Anyone who has it is
            signed in as you until you sign out. Do not send it to anyone.
          </p>
          <div className="button-row">
            <button type="button" onClick={() => navigator.clipboard?.writeText(transfer)}>
              Copy it
            </button>
            <button type="button" className="secondary" onClick={() => setTransfer(null)}>
              Hide it
            </button>
          </div>
        </>
      )}

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
