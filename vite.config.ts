import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/suttons-merlin-prototype/',
  plugins: [react()],
  server: { port: 5191 },
})
