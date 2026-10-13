import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendUrl = env.VITE_BACKEND_URL || env.VITE_API_BASE_URL || 'https://multimodal-ai-chatbot-5hsv.onrender.com';

  return {
    plugins: [
      react(),
      tailwindcss()
    ],
    server: {
      port: 5173,
      proxy: {
        '/api': {
          target: backendUrl,
          changeOrigin: true
        },
        '/upload': {
          target: backendUrl,
          changeOrigin: true
        }
      }
    }
  };
});
