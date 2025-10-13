import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Point Vite at the new frontend folder (with a space in the name)
export default defineConfig({
  root: 'frontend',
  envDir: '..',
  plugins: [react()],
});
