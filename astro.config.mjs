import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';

export default defineConfig({
  site: 'https://ondrahajek.com',
  output: 'static',
  integrations: [tailwind()],
  vite: {
    resolve: {
      alias: {
        '~': '/src',
      },
    },
  },
});
