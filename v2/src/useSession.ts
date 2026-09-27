import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import { isConfigured } from './config'

/**
 * Who is signed in, if anyone.
 *
 * `loading` exists to avoid a flash of the sign-in screen while the browser
 * checks for an existing session - which it does on every page load, including
 * when someone arrives by clicking a magic link.
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(isConfigured)

  useEffect(() => {
    if (!isConfigured) return

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(next)
      setLoading(false)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  return { session, loading }
}
