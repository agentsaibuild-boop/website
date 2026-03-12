# AIBUILD AGENTS – Product Architecture & Technical Overview

## 1. Project Summary

AIBUILD AGENTS е уеб базирана платформа за автоматизация на процеси в строителния сектор чрез AI агенти. Основната функционалност е изграждане на системи, които обработват техническа документация, анализират строителни задания и подпомагат създаването на технически предложения.

Платформата ще функционира като **SaaS услуга**, при която потребителите получават достъп до защитена работна среда след успешно плащане.

Основни характеристики:

- AI агенти за обработка на строителна документация
- автоматизация на технически предложения
- анализ на PDF и структурирани файлове
- защитена работна среда за потребители
- достъп чрез абонамент или еднократно плащане

---

## 2. Product Vision

Целта на платформата е да намали значително времето за подготовка на технически предложения и анализ на строителна документация.

Платформата предоставя:

- AI анализ на документи
- автоматично структуриране на информация
- инструменти за подготовка на оферти
- централизирана работна среда

Основна целева аудитория:

- строителни компании
- инженери и проектанти
- проектни мениджъри
- консултанти в строителния сектор

---

## 3. System Architecture Overview

Системата се състои от два основни слоя.

### 3.1. Public Website (Marketing Layer)

Публичната маркетинг страница е изградена с **Astro v5** и **Tailwind CSS v4**. Съдържа:

| Страница | Route | Предназначение |
|----------|-------|----------------|
| Начало | `/` | Landing page с hero, features, metrics, FAQ, CTA |
| Решения | `/resheniya` | Архитектура на платформата и модули |
| Приложения | `/приложения` | Use cases и продуктов roadmap |
| За нас | `/за-нас` | Мисия и ценности |
| Контакт | `/контакт` | Форма за контакт и директни данни |
| Поверителност | `/политика-за-поверителност` | GDPR / правна страница |

**Забележка:** Всички маршрути поддържат двоен URL формат – кирилица (`/за-нас`) и латиница (`/za-nas`).

Технологии:

- **Astro v5.4** – Static Site Generator
- **Tailwind CSS v4** – utility-first CSS
- **Bun** – package manager
- `@astrojs/sitemap` – auto-generated sitemap.xml
- Static rendering + CDN caching
- Schema.org JSON-LD на всяка страница (SEO)
- Open Graph + Twitter Card метаданни

---

### 3.2. Application Layer (Protected Workspace) *(Planned)*

След плащане потребителят получава достъп до защитена среда.

Тази среда ще включва:

- потребителски акаунт и dashboard
- управление на документи
- AI инструменти за анализ
- история на действията (audit log)

Функционалности:

- authentication + session management
- role-based access control (RBAC)
- user workspace
- document processing pipeline
- audit logging

---

## 4. Frontend Architecture

### Design System

Дизайн системата е дефинирана в `src/styles/global.css` чрез Tailwind v4 `@theme` токени:

| Токен | Стойност | Употреба |
|-------|----------|----------|
| `--color-bg` | `#F4F3F1` | Основен фон (топъл бетон) |
| `--color-accent` | `#1B398F` | Стомано синьо (бранд цвят) |
| `--color-dark` | `#111111` | Footer / тъмни секции |
| `--color-text` | `#0C0C0C` | Основен текст |
| `--color-muted` | `#5C5A57` | Вторичен текст |

**Типография:** fluid typography с `clamp()` – H1: `clamp(2.375rem, 5.5vw, 4rem)`

### Component Library

| Компонент | Файл | Описание |
|-----------|------|----------|
| Header | `Header.astro` | Sticky nav, мобилно меню, active page detection |
| Footer | `Footer.astro` | Dark footer, контакти, навигация |
| Hero | `Hero.astro` | 2-колонен layout, изометрична SVG илюстрация |
| FeatureGrid | `FeatureGrid.astro` | 6 feature карти, responsive grid (1→2→3 колони) |
| Steps | `Steps.astro` | 4-стъпков процес с номерирани badges |
| ProofMetrics | `ProofMetrics.astro` | Dark секция с метрики (до 80%, <3мин, 4×) |
| FAQ | `FAQ.astro` | Native `<details>` accordion – нулев JavaScript |
| CTABlock | `CTABlock.astro` | CTA секция в light/dark режим |

---

## 5. Payment System *(Planned)*

Плащанията ще се обработват чрез **Stripe**.

Процесът:

1. потребителят избира план
2. стартира Stripe Checkout
3. плащането се обработва от Stripe
4. Stripe изпраща webhook към backend
5. системата активира достъпа на потребителя

**Важно:** достъпът **не се активира от success page**, а само след потвърждение от Stripe webhook. Това предотвратява злоупотреби при директно отваряне на success URL.

---

## 6. User Access Model *(Planned)*

Всеки потребител ще има следните атрибути:

```
user_id           UUID
email             string (unique)
account_status    enum: inactive | active | expired | suspended
subscription_plan string
subscription_expiry datetime
created_at        datetime
last_login_ip     string
```

---

## 7. Security Model *(Planned)*

Системата ще включва:

- authentication + session management
- role-based access control
- login tracking + IP logging
- audit logs за всички действия
- webhook signature verification (Stripe)

Сигурността **не разчита само на IP адреси**.

---

## 8. Technology Stack

### Frontend (Current)

| Технология | Версия | Роля |
|------------|--------|------|
| Astro | 5.4.0 | Static Site Generator |
| Tailwind CSS | 4.0.0 | Styling |
| @tailwindcss/vite | 4.0.0 | Vite интеграция |
| @astrojs/sitemap | 3.2.1 | SEO sitemap |
| TypeScript | native | Type safety |
| Bun | latest | Package manager |

### Backend *(Planned)*

- Node.js + server API routes
- Stripe integration (webhooks)
- PostgreSQL – user management, subscriptions, logs

### Infrastructure

- Български хостинг с ниска latency за локални потребители
- CDN caching за статичните assets
- Основен домейн + `app.` subdomain за приложението

---

## 9. Hosting Strategy

Публичният сайт ще бъде хостван на **Cloudflare Pages** или **Netlify** (препоръчително):

```
Сайт:          example.bg
Приложение:    app.example.bg
```

| Платформа | Build команда | Output директория |
|-----------|--------------|-------------------|
| Cloudflare Pages | `bun run build` | `dist/` |
| Netlify | `bun run build` | `dist/` |
| Vercel | auto-detect Astro | `dist/` |

**Причини за българска инфраструктура:**

- ниска latency за локални потребители
- стабилна техническа поддръжка
- съответствие с GDPR при местно съхранение на данни

---

## 10. SEO Architecture

| Елемент | Статус | Детайли |
|---------|--------|---------|
| Sitemap | ✅ | Auto-generated, weekly changefreq |
| Robots.txt | ✅ | Blocks /api/, /_astro/ |
| Schema.org | ✅ | Organization + WebSite на всяка страница |
| Open Graph | ✅ | og:title, og:description, og:image |
| Twitter Card | ✅ | summary_large_image |
| Canonical URLs | ✅ | BaseLayout.astro |
| Fluid Typography | ✅ | clamp() за всички заглавия |
| Accessibility | ✅ | ARIA labels, skip-to-main, semantic HTML |

---

## 11. Future Development Roadmap

**V1 – Current:** Marketing website (Astro, static)

**V2 – Next:**
1. Authentication система
2. PostgreSQL база данни
3. Stripe integration + webhooks
4. User dashboard

**V3 – Future:**
- AI document processing pipeline
- PDF анализ и структуриране
- Workflow automation
- API integrations
- Enterprise access control
- Multi-tenant архитектура

---

## 12. Development Workflow

Кодът се разработва чрез:

- **VS Code** с AI-assisted development
- **Git** version control
- **Bun** за package management

Основни принципи:

- modular component architecture
- separation of marketing layer от application layer
- mobile-first responsive design
- zero JavaScript там, където не е необходим (native HTML)

---

## 13. Documentation

```
README.md                    – Бърз старт
PROJECT_OVERVIEW.md          – Настоящият документ
ARCHITECTURE.md              – Детайлна архитектурна документация
DEPLOYMENT.md                – Инструкции за деплой
```

Целта е нов разработчик да може да разбере системата в рамките на няколко часа.

---

## 14. Current Status

### Изградено

| Елемент | Статус |
|---------|--------|
| Astro проект v5 | ✅ |
| Пълна страничен структура (6 страници) | ✅ |
| Component library (8 компонента) | ✅ |
| Design system (токени, типография) | ✅ |
| SEO (Schema.org, OG, sitemap) | ✅ |
| Responsive design | ✅ |
| Accessibility | ✅ |
| Dual URL routing (BG/EN) | ✅ |

### Предстои

| Елемент | Приоритет |
|---------|-----------|
| Authentication система | High |
| PostgreSQL база данни | High |
| Stripe integration | High |
| User dashboard | High |
| AI document processing | Medium |
| OG default image | Low |

---

*Документ версия: 1.0 | Дата: 2026-03 | Платформа: AIBUILD AGENTS*
