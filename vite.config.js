import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   host: '192.168.1.15', // allow external connections
  //   port: 5173,       // or whatever port you're using
  // },
})
