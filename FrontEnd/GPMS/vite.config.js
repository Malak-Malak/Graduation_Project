// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  server: {
    port: 5173,

    // ✅ Proxy — كل request يبدأ بـ /api بيروح للـ backend مباشرة
    // هذا يحل مشكلة CORS في التطوير بدون ما تحتاجي تعدلي الـ backend
    proxy: {
      '/api': {
        target: 'https://gpms.up.railway.app',
        changeOrigin: true,   // ← هذا هو اللي بيحل الـ CORS
        secure: true,
        // rewrite: (path) => path  // المسار بيبقى كما هو /api/...
      }
    }
  }
})