import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';

function safePublicCopy(): import('vite').Plugin {
  return {
    name: 'safe-public-copy',
    apply: 'build',
    closeBundle() {
      const publicDir = path.resolve(__dirname, 'public');
      const distDir = path.resolve(__dirname, 'dist');
      if (!fs.existsSync(publicDir)) return;
      const files = fs.readdirSync(publicDir);
      for (const file of files) {
        const src = path.join(publicDir, file);
        const dest = path.join(distDir, file);
        try {
          fs.accessSync(src, fs.constants.R_OK);
          fs.copyFileSync(src, dest);
        } catch {
          console.warn(`[safe-public-copy] Skipped unreadable file: ${file}`);
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), safePublicCopy()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    copyPublicDir: false,
  },
});
