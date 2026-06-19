import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Project site lives at https://<user>.github.io/resume/ — keep base in sync with the repo name.
export default defineConfig({
  base: '/resume/',
  plugins: [react(), tailwindcss()],
});
