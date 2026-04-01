import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://ondrahajek.com',
  output: 'static',
  integrations: [tailwind(), sitemap()],
  vite: {
    build: {
      assetsInlineLimit: 0,
      rollupOptions: {
        output: {
          entryFileNames: '_astro/[name].[hash].js',
          chunkFileNames: '_astro/[name].[hash].js',
        },
      },
    },
    resolve: {
      alias: {
        '~': '/src',
      },
    },
  },
});
