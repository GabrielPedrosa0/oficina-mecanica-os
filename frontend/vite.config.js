import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Em desenvolvimento, /api vai para o FastAPI rodando na porta 8000
    // (dentro de backend/: uvicorn app:app --reload). Na Vercel quem faz isso é o vercel.json.
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
  // O mesmo repasse no `npm run preview` (testar a versão final no computador).
  preview: {
    proxy: {
      '/api': 'http://127.0.0.1:8000',
    },
  },
})
