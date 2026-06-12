import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://aibuildagents.bg',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
      // Решение: кирилските URL-и са noindex redirect страници — не им е мястото в sitemap
      filter: (page) => !/[а-я]/i.test(decodeURIComponent(page)),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
