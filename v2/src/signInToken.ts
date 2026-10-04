import type { EmailOtpType } from '@supabase/supabase-js'

/**
 * Working out what someone has pasted into the sign-in box.
 *
 * Two things can be pasted, and both are accepted:
 *
 *  - The sign-in LINK from the email. Supabase puts the token in that URL as a
 *    query parameter, and `verifyOtp` will accept it directly as a token_hash.
 *    This is the route that works today.
 *
 *  - A six-digit CODE. Supabase can put one in the email, but only for
 *    projects that have their own email provider configured. Accepting it
 *    costs nothing and means nothing has to change here if that is ever set up.
 */

/** Marks a transfer string so it cannot be confused with anything else. */
export const TRANSFER_PREFIX = 'fcards1:'

export function makeTransferCode(accessToken: string, refreshToken: string): string {
  return TRANSFER_PREFIX + btoa(JSON.stringify({ a: accessToken, r: refreshToken }))
}

export type Parsed =
  | { kind: 'transfer'; accessToken: string; refreshToken: string }
  | { kind: 'code'; token: string }
  | { kind: 'link'; tokenHash: string; typesToTry: EmailOtpType[] }
  | { kind: 'unusable'; reason: string }

const EMAIL_TYPES: EmailOtpType[] = ['email', 'magiclink', 'signup', 'invite', 'recovery', 'email_change']

export function parseSignIn(input: string): Parsed {
  const text = input.trim()
  if (text.length === 0) return { kind: 'unusable', reason: 'Nothing was pasted.' }

  // A session handed over from somewhere already signed in.
  if (text.startsWith(TRANSFER_PREFIX)) {
    try {
      const payload = JSON.parse(atob(text.slice(TRANSFER_PREFIX.length))) as {
        a?: string
        r?: string
      }
      if (typeof payload.a === 'string' && typeof payload.r === 'string') {
        return { kind: 'transfer', accessToken: payload.a, refreshToken: payload.r }
      }
    } catch {
      // fall through to the message below
    }
    return { kind: 'unusable', reason: 'That transfer code is incomplete. Copy the whole of it.' }
  }

  // A plain six-digit code.
  if (/^\d{6}$/.test(text)) return { kind: 'code', token: text }

  let url: URL
  try {
    url = new URL(text)
  } catch {
    return {
      kind: 'unusable',
      reason:
        'That does not look like a sign-in link. Copy the whole link from the email, starting with https://',
    }
  }

  const tokenHash = url.searchParams.get('token_hash') ?? url.searchParams.get('token')
  if (!tokenHash) {
    // The address after the link has already been followed carries the session
    // in the part after the #, and is no use here - the token is spent.
    if (url.hash.includes('access_token')) {
      return {
        kind: 'unusable',
        reason:
          'That link has already been used. Sign-in links work once, so ask for a new email and copy the link without opening it.',
      }
    }
    return { kind: 'unusable', reason: 'That link has no sign-in token in it.' }
  }

  /**
   * The link says type=magiclink, but a token_hash is verified as type 'email'
   * - that is what the documented example does. Passing 'magiclink' is
   * rejected, and the rejection reads as "invalid or expired", which sends you
   * looking for an expiry problem that is not there.
   *
   * Both are returned so the caller can try one and fall back to the other,
   * rather than this guess being a single point of failure.
   */
  const rawType = url.searchParams.get('type') ?? 'email'
  const linkType = (EMAIL_TYPES as string[]).includes(rawType)
    ? (rawType as EmailOtpType)
    : 'email'

  const typesToTry: EmailOtpType[] =
    linkType === 'email' ? ['email'] : ['email', linkType]

  return { kind: 'link', tokenHash, typesToTry }
}
