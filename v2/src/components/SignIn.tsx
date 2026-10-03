import { useState } from 'react'
import { supabase, redirectTarget } from '../supabase'

/**
 * Signing in by email. No passwords.
 *
 * TWO ways in, deliberately:
 *
 *  - A link in the email, which is the quick path on a laptop.
 *  - A six-digit code typed into this screen.
 *
 * The code exists because of how phones handle an app added to the home
 * screen. That app gets its own private storage, separate from the browser -
 * so a link opened in Safari signs in Safari, and the home screen app still
 * shows the sign-in page. It also has no address bar, so the link cannot be
 * pasted in either. Typing a code is the only route that stays inside the app,
 * and it works everywhere else too.
 *
 * The screen never says whether an address is recognised. Only invited people
 * can get in, and telling a stranger "that email isn't on the list" tells them
 * something they do not need to know.
 */
export function SignIn() {
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function requestCode(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTarget() },
    })

    setBusy(false)
    if (error) {
      setError(error.message)
      return
    }
    setSent(true)
  }

  async function submitCode(event: React.FormEvent) {
    event.preventDefault()
    setBusy(true)
    setError(null)

    const { error } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: code.trim(),
      type: 'email',
    })

    setBusy(false)
    if (error) {
      setError(
        /expired|invalid/i.test(error.message)
          ? 'That code was not accepted. It may have expired — send yourself a new one.'
          : error.message,
      )
    }
    // On success the app notices the new session and this screen disappears.
  }

  if (sent) {
    return (
      <form className="panel" onSubmit={submitCode}>
        <h2>Check your email</h2>
        <p>
          If <strong>{email.trim()}</strong> is on the list, an email is on its
          way with a <strong>six-digit code</strong> and a sign-in link.
        </p>

        <div className="field">
          <label className="field-label" htmlFor="code">
            Enter the code
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            value={code}
            placeholder="123456"
            onChange={(event) => setCode(event.target.value)}
          />
          <p className="hint">
            On a phone, use the code rather than the link &mdash; especially if
            you added this to your home screen, where a link opened in your
            browser will not sign you in here.
          </p>
        </div>

        <div className="button-row">
          <button type="submit" disabled={busy || code.trim().length === 0}>
            {busy ? 'Checking…' : 'Sign in'}
          </button>
          <button
            type="button"
            className="secondary"
            disabled={busy}
            onClick={() => {
              setSent(false)
              setCode('')
              setError(null)
            }}
          >
            Use a different address
          </button>
        </div>

        {error && (
          <p className="notice warning" role="alert">
            {error}
          </p>
        )}

        <p className="hint">
          The code and the link each work once, and expire after an hour.
          Nothing arrived? Check your spam folder, then try again.
        </p>
      </form>
    )
  }

  return (
    <form className="panel" onSubmit={requestCode}>
      <h2>Sign in</h2>
      <p className="panel-intro">
        This app is private, shared between a few friends. Enter your email and
        we will send you a code &mdash; there is no password to remember.
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

      <button type="submit" disabled={busy || email.trim().length === 0}>
        {busy ? 'Sending…' : 'Email me a code'}
      </button>

      {error && (
        <p className="notice warning" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
