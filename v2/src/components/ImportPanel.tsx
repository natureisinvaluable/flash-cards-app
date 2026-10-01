import { useRef, useState } from 'react'
import type { Card, Category } from '../types'
import { parseBackupFile, type ImportedFile } from '../importBackup'
import { planImport, runImport, type ImportPlan } from '../importRun'

/**
 * Bringing a v1 collection into the shared pool. Owner only.
 *
 * Anyone may add a card, but adding several hundred at once changes the app
 * for everybody, so this is kept to the owner - the same instinct behind
 * owner-only deleting.
 *
 * Nothing is written until the numbers have been shown and confirmed.
 */
export function ImportPanel({
  userId,
  cards,
  categories,
  onDone,
}: {
  userId: string
  cards: Card[]
  categories: Category[]
  onDone: () => void
}) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<{ name: string; file: ImportedFile; plan: ImportPlan } | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<number | null>(null)
  const [done, setDone] = useState<string | null>(null)

  async function handleFileChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const chosen = event.target.files?.[0]
    event.target.value = '' // let the same file be picked again after a cancel
    if (!chosen) return

    setError(null)
    setDone(null)

    const result = parseBackupFile(await chosen.text())
    if (!result.ok) {
      setError(result.error)
      return
    }
    setWarning(result.warning ?? null)
    setPending({
      name: chosen.name,
      file: result.file,
      plan: planImport(result.file, new Set(cards.map((c) => c.id)), categories),
    })
  }

  async function confirm() {
    if (!pending) return
    setProgress(0)
    try {
      await runImport(userId, pending.file, categories, (doneCount, total) =>
        setProgress(Math.round((doneCount / total) * 100)),
      )
      setDone(`Imported ${pending.plan.total} cards from ${pending.name}.`)
      setPending(null)
      onDone()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setProgress(null)
    }
  }

  return (
    <section className="panel">
      <h2>Bring in a version 1 collection</h2>
      <p className="panel-intro">
        Adds the cards from a version 1 backup file to the shared pool, and
        files them the way you had them filed. Cards already here are updated
        rather than duplicated, so running this twice is harmless.
      </p>

      <div className="button-row">
        <button type="button" onClick={() => fileInput.current?.click()} disabled={progress !== null}>
          Choose a backup file
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChosen}
          hidden
        />
      </div>

      {done && <p className="notice success">{done}</p>}
      {error && (
        <p className="notice warning" role="alert">
          {error}
        </p>
      )}
      {progress !== null && <p className="hint">Importing&hellip; {progress}%</p>}

      {pending && progress === null && (
        <div className="confirm" role="alertdialog" aria-label="Confirm import">
          <p>
            <code>{pending.name}</code> holds{' '}
            <strong>{pending.plan.total} cards</strong>.
          </p>
          <p>
            <strong>{pending.plan.brandNew}</strong> would be new to the shared
            pool and <strong>{pending.plan.alreadyPresent}</strong> are already
            here and would be updated in place.
          </p>

          <p className="hint">How your categories line up:</p>
          <ul className="import-mapping">
            {pending.plan.mapping.map((row) => (
              <li key={row.name}>
                <strong>{row.name}</strong> ({row.cards}){' '}
                {row.to ? (
                  <>&rarr; {row.to.name}</>
                ) : (
                  <em>&rarr; no match, these will arrive unsorted</em>
                )}
              </li>
            ))}
          </ul>

          {warning && <p className="notice warning">Note: {warning}.</p>}

          <p>
            Everyone else will see these cards as new. Your filing is yours and
            is not passed on to them.
          </p>

          <div className="button-row">
            <button type="button" onClick={confirm}>
              Import {pending.plan.total} cards
            </button>
            <button type="button" className="secondary" onClick={() => setPending(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
