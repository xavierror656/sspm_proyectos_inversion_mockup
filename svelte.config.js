import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess(),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: '404.html',
      precompress: false,
      strict: true
    }),
    paths: {
      // En GitHub Pages el sitio se sirve en /<repositorio>/.
      // El workflow define BASE_PATH = /<repositorio> al construir.
      base: process.env.BASE_PATH || ''
    },
    prerender: {
      // El enlace /forms#database apunta a una pestaña que se renderiza
      // del lado del cliente, así que el ancla no existe en el HTML estático.
      handleMissingId: 'warn'
    }
  }
};

export default config;
