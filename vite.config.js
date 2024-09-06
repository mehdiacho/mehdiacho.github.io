import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  base: '/mehdiacho.github.io/', // Replace with your actual repository name
  plugins: [react()],
})
