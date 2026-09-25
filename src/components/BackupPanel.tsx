import { useRef, useState } from 'react'
import type { AppData } from '../types'
import { downloadBackup, parseBackup } from '../backup'

interface PendingRestore {
  filename: string
  data: AppData
  warning?: string
}

/**
 * Save a copy of everything to a file, and read one back.
 *
 * Restoring replaces everything currently in the app, so it always stops for
 * confirmation and shows the numbers on both sides before anything happens.
 */
export function BackupPanel({
  data,
  onRestore,
}: {
  data: AppData
  onRestore: (restored: AppData) => void
}) {
  const fileInput = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<PendingRestore | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

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

  function confirmRestore() {
    if (!pending) return
    onRestore(pending.data)
    setMessage(`Restored ${pending.data.cards.length} cards from ${pending.filename}.`)
    setPending(null)
  }

  return (
    <section className="panel">
      <h2>Backup</h2>

      <p className="panel-intro">
        Your cards live in this browser on this device only. If you clear your
        browsing data or change device, they are gone and cannot be recovered.
        A backup file is the only copy.
      </p>

      <div className="button-row">
        <button type="button" onClick={handleDownload}>
          Download backup
        </button>
        <button type="button" className="secondary" onClick={() => fileInput.current?.click()}>
          Restore from backup
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

      {pending && (
        <div className="confirm" role="alertdialog" aria-label="Confirm restore">
          <p>
            <strong>Replace everything with this backup?</strong>
          </p>
          <p>
            <code>{pending.filename}</code> contains{' '}
            <strong>
              {pending.data.cards.length} {pending.data.cards.length === 1 ? 'card' : 'cards'}
            </strong>{' '}
            in {pending.data.categories.length} categories.
          </p>
          <p>
            This will replace the{' '}
            <strong>
              {data.cards.length} {data.cards.length === 1 ? 'card' : 'cards'}
            </strong>{' '}
            currently in the app. Anything not in the backup will be lost.
          </p>
          {pending.warning && <p className="notice warning">Note: {pending.warning}.</p>}
          <div className="button-row">
            <button type="button" onClick={confirmRestore}>
              Yes, replace my cards
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
