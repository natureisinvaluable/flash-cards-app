import { supabase } from './supabase'
import { isConfigured } from './config'
import { useSession } from './useSession'
import { SignIn } from './components/SignIn'
import { AccountPanel } from './components/AccountPanel'
import { SharedCards } from './components/SharedCards'

export default function App() {
  const { session, loading } = useSession()

  return (
    <main className="shell">
      <header>
        <h1>Portuguese Flashcards</h1>
        <p className="tagline">Version 2 &middot; shared between friends</p>
      </header>

      {!isConfigured ? (
        <section className="panel">
          <h2>Not connected yet</h2>
          <p>
            This copy of the app has no database details in it, so there is
            nothing to sign in to. See <code>v2/src/config.ts</code>.
          </p>
          <p>
            <a href="/flash-cards-app/">Go to version 1 &rarr;</a>
          </p>
        </section>
      ) : loading ? (
        <p className="hint">Checking whether you are signed in&hellip;</p>
      ) : !session ? (
        <SignIn />
      ) : (
        <>
          <AccountPanel session={session} />

          <SharedCards />

          <section className="panel">
            <p>
              <strong>Your own cards are not here yet.</strong> They are still in
              version 1, working as usual, and will be brought across once the
              rest of v2 is built.
            </p>
            <div className="button-row">
              <button type="button" className="secondary" onClick={() => supabase.auth.signOut()}>
                Sign out
              </button>
            </div>
            <p>
              <a href="/flash-cards-app/">Go to version 1 &rarr;</a>
            </p>
          </section>
        </>
      )}
    </main>
  )
}
