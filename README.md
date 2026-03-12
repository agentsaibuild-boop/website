# AIBUILD AGENTS — Корпоративен уебсайт

Статичен корпоративен сайт на **Astro 5 + Tailwind CSS v4**. Само на български. SEO-first, mobile-first.

## Стек

| Технология | Версия | Роля |
|---|---|---|
| [Astro](https://astro.build) | ^5.4 | SSG framework |
| [Tailwind CSS](https://tailwindcss.com) | ^4.0 | Utility CSS |
| [@tailwindcss/vite](https://tailwindcss.com/docs/installation/framework-guides/astro) | ^4.0 | Vite plugin за TW v4 |
| [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) | ^3.2 | Автоматичен sitemap.xml |

## Бърз старт

```bash
# 1. Инсталирай зависимостите
npm install

# 2. Стартирай dev сървър
npm run dev
# → http://localhost:4321

# 3. Production build
npm run build
# → ./dist/

# 4. Preview на build
npm run preview
```

## Файлова структура

```
aibuild-website/
├── public/
│   ├── favicon.svg          # SVG favicon (L-bracket / инженерен знак)
│   └── robots.txt           # SEO robots
├── src/
│   ├── components/
│   │   ├── Header.astro     # Sticky header + мобилно меню
│   │   ├── Footer.astro     # Footer с линкове и контакт
│   │   ├── Hero.astro       # Hero секция
│   │   ├── FeatureGrid.astro# Grid с feature cards
│   │   ├── Steps.astro      # Numbered steps (sticky header)
│   │   ├── ProofMetrics.astro # Metrics на тъмен фон
│   │   ├── FAQ.astro        # Accordion (native <details>, без JS)
│   │   └── CTABlock.astro   # CTA секция (светла / тъмна)
│   ├── layouts/
│   │   └── BaseLayout.astro # Head, SEO, Schema.org, Header+Footer
│   ├── pages/
│   │   ├── index.astro
│   │   ├── решения.astro
│   │   ├── приложения.astro
│   │   ├── за-нас.astro
│   │   ├── контакт.astro
│   │   ├── политика-за-поверителност.astro
│   │   └── 404.astro
│   └── styles/
│       └── global.css       # @theme токени + base styles
├── astro.config.mjs
└── package.json
```

## SEO

- `sitemap.xml` — автогенериран от `@astrojs/sitemap` след `npm run build`
- `robots.txt` — в `public/`
- Canonical URL — автоматично от `Astro.url` в `BaseLayout`
- Open Graph + Twitter Card — на всяка страница
- Schema.org JSON-LD:
  - `Organization` + `WebSite` — на всяка страница
  - `SoftwareApplication` — `/решения`
  - `ItemList` + `Service` — `/приложения`
  - `FAQPage` — homepage
  - `ContactPage` — `/контакт`
  - `AboutPage` — `/за-нас`

## Персонализация

### Замяна на placeholders

| Placeholder | Файл | Какво да смените |
|---|---|---|
| `example.com` | `astro.config.mjs`, `BaseLayout.astro` | Реалния домейн |
| `hello@example.com` | `Footer.astro`, `контакт.astro`, `политика-за-поверителност.astro` | Реален имейл |
| `+359 000 000 000` | `Footer.astro`, `контакт.astro` | Реален телефон |
| `AIBUILD AGENTS` | Навсякъде | Реалното брандинг |

### Добавяне на webfont (по желание)

В `src/layouts/BaseLayout.astro`, в `<head>`:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap">
```

В `src/styles/global.css`, в `@theme {}`:
```css
--font-family-sans: 'Inter', system-ui, sans-serif;
```

### Контактна форма — backend

Формата в `/контакт` е готова за:

**Netlify Forms** (ако деплойвате на Netlify):
```html
<form name="contact" netlify method="POST">
```
Netlify автоматично засича `netlify` атрибута.

**Formspree**:
```html
<form action="https://formspree.io/f/YOUR_ID" method="POST">
```

## Deploy

### Cloudflare Pages (препоръчан)
```
Build command:  npm run build
Output dir:     dist
Node version:   20
```
Cloudflare Pages поддържа кирилица в URL пътища без допълнителна конфигурация.

### Netlify
```
Build command:  npm run build
Publish dir:    dist
```
Добавете `netlify` атрибут към формата за безплатни форм submissions.

### Vercel
```bash
npx vercel --prod
```
Или свържете GitHub repo в Vercel dashboard. Framework preset: Astro.

## Дизайн система

| Token | Стойност | Употреба |
|---|---|---|
| `--color-bg` | `#F4F3F1` | Основен фон (топъл бетон) |
| `--color-text` | `#0C0C0C` | Основен текст |
| `--color-accent` | `#1B398F` | Стоманено синьо |
| `--color-muted` | `#5C5A57` | Вторичен текст |
| `--color-dark` | `#111111` | Тъмни секции / footer |
| `--color-border` | `#DEDAD5` | Линии и рамки |

## Лиценз

Частен проект. Всички права запазени.
