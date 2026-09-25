import { useAppData } from './useAppData'
import { CardList } from './components/CardList'
import { ColourLegend } from './components/ColourLegend'
import { BackupPanel } from './components/BackupPanel'

export default function App() {
  const { data, update, saveFailed } = useAppData()

  return (
    <main className="shell">
      <header>
        <h1>Portuguese Flashcards</h1>
        <p className="tagline">European Portuguese &middot; a private study app</p>
      </header>

      {saveFailed && (
        <p className="notice warning" role="alert">
          <strong>Your changes are not being saved.</strong> This browser is
          refusing to store data, which can happen in a private window or if site
          data is blocked. Anything you add now will be lost when you close the tab.
        </p>
      )}

      <ColourLegend meanings={data.colourMeanings} />

      <CardList data={data} />

      <BackupPanel data={data} onRestore={(restored) => update(() => restored)} />

      <p className="privacy-note">
        Your cards are stored on this device only. Nothing is sent anywhere.
      </p>
    </main>
  )
}
