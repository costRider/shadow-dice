/*import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})*/

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite"; // ✅ 이게 핵심!

export default defineConfig({
  plugins: [
    react(),
    tailwind(), // ✅ 여기에서 Tailwind가 연결됨
  ],
});
