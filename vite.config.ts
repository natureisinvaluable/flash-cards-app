import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` must match the GitHub Pages sub-path: the site is served from
// https://natureisinvaluable.github.io/flash-cards-app/ rather than the root
// of the domain. Without this, the published page loads but finds no styles
// or scripts. Local development is unaffected.
export default defineConfig({
  plugins: [react()],
  base: '/flash-cards-app/',
})
