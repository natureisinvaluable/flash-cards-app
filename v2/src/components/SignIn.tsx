import { useState } from 'react'
import { supabase, redirectTarget } from '../supabase'
import { parseSignIn } from '../signInToken'

/**
 * Signing in by email. No passwords.
 *
 * TWO ways in, deliberately:
 *
 *  - Clicking the link in the email, which is the quick path on a laptop.
 *  - PASTING that same link into this screen, which is the path on a phone.
 *
 * The paste box exists because of how phones handle an app added to the home
 * screen. That app gets its own private storage, separate from the browser -
 * so a link opened in Safari signs in Safari, and the home screen app still
 * shows the sign-in page. Pasting the link keeps the whole thing inside the
 * app.
 *
 * The link carries the sign-in token as a query parameter, which verifyOtp
 * accepts directly, so none of this needs the email itself to change. A
 * six-digit code is accepted too, for the day this project has its own email
 * provider and can put one in the message.
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

    const parsed = parseSignIn(code)
    if (parsed.kind === 'unusable') {
      setError(parsed.reason)
      return
    }

    setBusy(true)
    setError(null)

    let lastError: string | null = null

    if (parsed.kind === 'transfer') {
      const { error } = await supabase.auth.setSession({
        access_token: parsed.accessToken,
        refresh_token: parsed.refreshToken,
      })
      setBusy(false)
      if (!error) return
      setError(`That transfer code was not accepted: "${error.message}". Make a fresh one.`)
      return
    }

    if (parsed.kind === 'link') {
      // Each attempt is recorded separately. Three guesses at this have now
      // failed, so the next failure needs to say something useful rather than
      // just "expired" again.
      const attempts: string[] = []
      for (const type of parsed.typesToTry) {
        const { error } = await supabase.auth.verifyOtp({ token_hash: parsed.tokenHash, type })
        if (!error) {
          setBusy(false)
          return // the app notices the new session and this screen disappears
        }
        attempts.push(`${type}: ${error.message}`)
      }
      // The token's shape, not its value - enough to tell a PKCE token from an
      // ordinary one, or a truncated paste from a whole one.
      const shape = `${parsed.tokenHash.length} characters, starts "${parsed.tokenHash.slice(0, 5)}"`
      lastError = `${attempts.join(' | ')} — token was ${shape}`
    } else {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: parsed.token,
        type: 'email',
      })
      if (!error) {
        setBusy(false)
        return
      }
      lastError = error.message
    }

    setBusy(false)
    // The real message is shown, not replaced. Supabase says "invalid or has
    // expired" for both a used link and a malformed one, and hiding that
    // behind friendlier wording sent us hunting for an expiry problem that
    // did not exist.
    setError(
      `Sign-in failed. ${lastError}. ` +
        'If this keeps happening, use a transfer code instead: sign in in your browser, then Settings → Sign in on another device.',
    )
  }

  if (sent) {
    return (
      <form className="panel" onSubmit={submitCode}>
        <h2>Check your email</h2>
        <p>
          If <strong>{email.trim()}</strong> is on the list, a sign-in email is
          on its way.
        </p>
        <p className="hint">
          On a laptop, just click the link in it &mdash; you can ignore the box
          below.
        </p>

        <div className="field">
          <label className="field-label" htmlFor="code">
            On a phone: paste the link here instead
          </label>
          <input
            id="code"
            type="text"
            inputMode="text"
            autoComplete="one-time-code"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            value={code}
            placeholder="https://…"
            onChange={(event) => setCode(event.target.value)}
          />
          <p className="hint">
            <strong>Press and hold</strong> the link in the email and choose{' '}
            <strong>Copy Link</strong> &mdash; do not tap it. Tapping opens it in
            your browser, which signs in your browser rather than this app, and
            uses the link up.
          </p>
          <p className="hint">
            This box also accepts a <strong>transfer code</strong>. If you are
            already signed in in your browser, open Settings there and use
            &ldquo;Sign in on another device&rdquo;.
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
          A sign-in link works once and expires after an hour. Nothing arrived?
          Check your spam folder, then try again.
        </p>
      </form>
    )
  }

  return (
    <form className="panel" onSubmit={requestCode}>
      <h2>Sign in</h2>
      <p className="panel-intro">
        This app is private, shared between a few friends. Enter your email and
        we will send you a sign-in link &mdash; there is no password to remember.
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
