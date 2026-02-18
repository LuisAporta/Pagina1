import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/Pagina1/",
  build: {
    // rollupOptions removed as default index.html is sufficient
  },
})
