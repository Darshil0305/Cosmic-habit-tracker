import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure raw asset imports work for shaders
  assetsInclude: ['**/*.vert', '**/*.frag', '**/*.glsl'],
})
