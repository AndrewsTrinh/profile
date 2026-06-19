import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Project site lives at https://<user>.github.io/profile/ — keep base in sync with the repo name.
export default defineConfig({
  base: '/profile/',
  plugins: [react(), tailwindcss()],
});
