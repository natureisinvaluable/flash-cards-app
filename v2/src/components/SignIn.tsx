import { useState } from 'react'
import { supabase, redirectTarget } from '../supabase'

/**
 * Signing in by email link. No passwords: you type your address, we email you
 * a link, clicking it signs you in.
 *
 * The screen deliberately does not say whether an address is recognised. Only
 * people who have been invited can get in, and telling a stranger "that email
 * isn't on the list" tells them more than they need to know.
 */
export function SignIn() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setSending(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTarget() },
    })

    setSending(false)
    if (error) {
      setError(error.message)
      return
    }
    setSent(true)
  }

  if (sent) {
    return (
      <section className="panel">
        <h2>Check your email</h2>
        <p>
          If <strong>{email.trim()}</strong> is on the list, a sign-in link is on
          its way. Open it on this device and you will be signed in.
        </p>
        <p className="hint">
          The link works once and expires after an hour. Nothing arrived? Check
          your spam folder, then try again.
        </p>
        <button type="button" className="secondary" onClick={() => setSent(false)}>
          Use a different address
        </button>
      </section>
    )
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2>Sign in</h2>
      <p className="panel-intro">
        This app is private, shared between a few friends. Enter your email and
        we will send you a link &mdash; there is no password to remember.
      </p>

      <div className="field">
        <label className="field-label" htmlFor="email">
          Your email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          required
          autoComplete="email"
          placeholder="you@example.com"
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <button type="submit" disabled={sending || email.trim().length === 0}>
        {sending ? 'Sending…' : 'Email me a link'}
      </button>

      {error && (
        <p className="notice warning" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
