import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// v2 is published alongside v1 on the same site: v1 stays at
// /flash-cards-app/ and v2 sits underneath it at /flash-cards-app/v2/.
// Getting this wrong publishes a page that loads but finds no styles.
export default defineConfig({
  plugins: [react()],
  base: '/flash-cards-app/v2/',
  server: {
    // v1's dev server uses 5173. Different port so both can run at once.
    port: 5174,
  },
})
