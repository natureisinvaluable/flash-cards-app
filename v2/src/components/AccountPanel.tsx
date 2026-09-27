import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../supabase'

interface Profile {
  id: string
  display_name: string
  is_owner: boolean
}

interface Category {
  id: string
  name: string
  sort_order: number
}

/**
 * Who you are, and what the database says about you.
 *
 * This exists to prove the plumbing rather than to be pretty: it reads back
 * through exactly the same path the rest of the app will use, so if the access
 * rules are wrong it shows up here rather than three stages later.
 */
export function AccountPanel({ session }: { session: Session }) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      const [profileResult, categoryResult] = await Promise.all([
        supabase.from('profiles').select('id, display_name, is_owner').eq('id', session.user.id).maybeSingle(),
        supabase.from('categories').select('id, name, sort_order').order('sort_order'),
      ])

      if (cancelled) return

      if (profileResult.error) setError(profileResult.error.message)
      else if (categoryResult.error) setError(categoryResult.error.message)
      else {
        setProfile(profileResult.data)
        setCategories(categoryResult.data ?? [])
      }
      setLoading(false)
    }

    load()
    return () => {
      cancelled = true
    }
  }, [session.user.id])

  if (loading) return <p className="hint">Loading your account&hellip;</p>

  if (error) {
    return (
      <p className="notice warning" role="alert">
        Could not read your account: {error}
      </p>
    )
  }

  if (!profile) {
    return (
      <p className="notice warning" role="alert">
        <strong>You are signed in, but you have no profile row.</strong> That
        means the trigger which creates one did not run. Nothing else will work
        until that is fixed.
      </p>
    )
  }

  return (
    <section className="panel">
      <h2>Your account</h2>

      <dl className="account">
        <dt>Signed in as</dt>
        <dd>{session.user.email}</dd>

        <dt>Name</dt>
        <dd>{profile.display_name || <em>not set</em>}</dd>

        <dt>Role</dt>
        <dd>
          {profile.is_owner ? (
            <>
              <strong>Owner</strong> &mdash; you are the only person who can
              delete cards
            </>
          ) : (
            'Member'
          )}
        </dd>
      </dl>

      <h3>Your categories</h3>
      {categories.length === 0 ? (
        <p className="notice warning">
          You have no categories. They should have been created when you first
          signed in.
        </p>
      ) : (
        <ol className="category-check">
          {categories.map((category) => (
            <li key={category.id}>{category.name}</li>
          ))}
        </ol>
      )}
      <p className="hint">
        These are yours alone. Everyone who joins gets their own set, and can
        rename them without affecting anyone else.
      </p>
    </section>
  )
}
