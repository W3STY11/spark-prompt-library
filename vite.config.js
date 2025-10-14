import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: 'src',
  publicDir: '../public',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        browse: resolve(__dirname, 'src/browse.html'),
        view: resolve(__dirname, 'src/view.html'),
        favorites: resolve(__dirname, 'src/favorites.html'),
      },
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
