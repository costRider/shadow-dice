/*import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})*/

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    tailwind(),   // Tailwind CSS 플러그인 추가
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },

  server: {
    proxy: {
      // 모든 /api 요청을 백엔드로 프록시
      '/api': {
        target: 'http://localhost:4000', // 백엔드 주소
        changeOrigin: true,
        // rewrite는 보통 필요 없음
      },
      '/resources': {
        target: 'http://localhost:4000', // 리소스 이미지 경로도 백엔드로!
        changeOrigin: true,
      }
    }
  }
});
