import { useMemo, useRef, useState } from 'react'
import type { AppData } from '../types'
import { downloadBackup, parseBackup } from '../backup'
import { mergeData } from '../merge'

interface PendingRestore {
  filename: string
  data: AppData
  warning?: string
}

/**
 * Save a copy of everything to a file, and read one back.
 *
 * A backup can be brought in two ways. Merging combines it with what is already
 * here and is the safe default - it is also how cards move between a laptop and
 * a phone without either losing work. Replacing throws away everything on this
 * device, which is what you want after a disaster and almost never otherwise,
 * so it is the quieter of the two buttons.
 */
export function BackupPanel({
  data,
  onMerge,
  onReplace,
}: {
  data: AppData
  onMerge: (incoming: AppData) => void
  onReplace: (incoming: AppData) => void
}) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<PendingRestore | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  // Work out what merging would do, so the numbers can be shown before
  // anything is committed.
  const preview = useMemo(
    () => (pending ? mergeData(data, pending.data) : null),
    [data, pending],
  )

  function handleDownload() {
    downloadBackup(data)
    setMessage('Backup saved to your downloads.')
    setError(null)
  }

  async function handleFileChosen(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    // Allow the same file to be chosen again after a cancel.
    event.target.value = ''
    if (!file) return

    setError(null)
    setMessage(null)

    const result = parseBackup(await file.text())
    if (!result.ok) {
      setError(result.error)
      return
    }
    setPending({ filename: file.name, data: result.data, warning: result.warning })
  }

  function confirmMerge() {
    if (!pending || !preview) return
    onMerge(pending.data)
    const { cardsAdded, cardsUpdated } = preview.summary
    setMessage(
      `Merged. ${cardsAdded} new ${cardsAdded === 1 ? 'card' : 'cards'} added, ` +
        `${cardsUpdated} updated. You now have ${preview.data.cards.length}.`,
    )
    setPending(null)
  }

  function confirmReplace() {
    if (!pending) return
    onReplace(pending.data)
    setMessage(`Replaced everything with ${pending.filename}.`)
    setPending(null)
  }

  return (
    <section className="panel">
      <h2>Backup</h2>

      <p className="panel-intro">
        Your cards live in this browser on this device only. If you clear your
        browsing data or change device, they are gone and cannot be recovered.
        A backup file is the only copy &mdash; and it is how you move cards
        between your laptop and your phone.
      </p>

      <div className="button-row">
        <button type="button" onClick={handleDownload}>
          Download backup
        </button>
        <button type="button" className="secondary" onClick={() => fileInput.current?.click()}>
          Open a backup
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          onChange={handleFileChosen}
          hidden
        />
      </div>

      {message && <p className="notice success">{message}</p>}
      {error && (
        <p className="notice warning" role="alert">
          {error}
        </p>
      )}

      {pending && preview && (
        <div className="confirm" role="alertdialog" aria-label="Choose how to open this backup">
          <p>
            <code>{pending.filename}</code> holds{' '}
            <strong>
              {pending.data.cards.length} {pending.data.cards.length === 1 ? 'card' : 'cards'}
            </strong>
            . You currently have <strong>{data.cards.length}</strong>.
          </p>

          {pending.warning && <p className="notice warning">Note: {pending.warning}.</p>}

          <div className="choice">
            <button type="button" onClick={confirmMerge}>
              Merge them
            </button>
            <p className="choice-detail">
              Keeps both sets. You would end up with{' '}
              <strong>{preview.data.cards.length} cards</strong> &mdash;{' '}
              {preview.summary.cardsAdded} new,{' '}
              {preview.summary.cardsUpdated} updated from the file,{' '}
              {preview.summary.cardsUnchanged} already up to date here.
              {preview.summary.cardsStayingDeleted > 0 && (
                <>
                  {' '}
                  {preview.summary.cardsStayingDeleted}{' '}
                  {preview.summary.cardsStayingDeleted === 1 ? 'card was' : 'cards were'} deleted
                  here on purpose and will stay deleted.
                </>
              )}{' '}
              Where the same card exists in both, the one edited most recently wins.
            </p>
          </div>

          <div className="choice">
            <button type="button" className="danger" onClick={confirmReplace}>
              Replace everything
            </button>
            <p className="choice-detail">
              Throws away the {data.cards.length} {data.cards.length === 1 ? 'card' : 'cards'} on
              this device and keeps only what is in the file. Use this to recover after losing
              everything, not to move cards between devices.
            </p>
          </div>

          <div className="button-row">
            <button type="button" className="secondary" onClick={() => setPending(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
