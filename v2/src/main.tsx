import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './styles.css'

/**
 * Store a copy of the app so it opens without a connection.
 *
 * Production only. During development the service worker would serve yesterday's
 * code back and make changes appear not to take effect, which is a confusing
 * way to lose an afternoon.
 */
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL })
      .catch(() => {
        // Not being able to work offline is a shame, not a failure worth
        // interrupting anyone over.
      })
  })
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
