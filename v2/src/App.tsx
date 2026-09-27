import { supabase } from './supabase'
import { isConfigured } from './config'
import { useSession } from './useSession'
import { SignIn } from './components/SignIn'
import { AccountPanel } from './components/AccountPanel'

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

          <section className="panel">
            <h2>Nothing here yet</h2>
            <p>
              The shared cards, filing them and studying all arrive in the stages
              that follow.
            </p>
            <p>
              <strong>Your cards are not here.</strong> They are still in version
              1, working as usual.
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
