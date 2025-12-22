# 📐 Static Site Development Standardization

This document outlines the standardized approach for building static websites with Gravito using the `@gravito/freeze` package family.

## 🎯 Purpose

We've established a standardized SSG (Static Site Generation) workflow to ensure:

1. ✅ Consistent behavior across React and Vue frameworks
2. ✅ Unified API for SSG detection and navigation
3. ✅ Built-in i18n (internationalization) support
4. ✅ Automatic environment detection
5. ✅ Prevention of common pitfalls

## � Package Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    @gravito/freeze                           │
│               (Framework-agnostic Core)                      │
├─────────────────────────────────────────────────────────────┤
│ • defineConfig()        • FreezeDetector                    │
│ • generateRedirects()   • generateLocalizedRoutes()         │
│ • generateSitemapEntries()                                  │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│   @gravito/freeze-react  │    │    @gravito/freeze-vue   │
├──────────────────────────┤    ├──────────────────────────┤
│ • FreezeProvider         │    │ • FreezePlugin           │
│ • useFreeze()            │    │ • useFreeze()            │
│ • StaticLink             │    │ • StaticLink             │
│ • LocaleSwitcher         │    │ • LocaleSwitcher         │
└──────────────────────────┘    └──────────────────────────┘
```

## 📚 Documentation Structure

| Document | Description |
|----------|-------------|
| [SSG Guide (English)](./en/guide/static-site-development.md) | Complete development guide |
| [SSG Guide (中文)](./zh-TW/guide/static-site-development.md) | 完整開發指南 |
| [Checklist](./STATIC_SITE_CHECKLIST.md) | Step-by-step checklist |
| [Quick Reference](./STATIC_SITE_QUICK_REFERENCE.md) | TL;DR guide |

## 🔑 Key Principles

### 1. Always Use @gravito/freeze

```bash
# Install for your framework
bun add @gravito/freeze-react  # React
bun add @gravito/freeze-vue    # Vue
```

### 2. Create Configuration

```typescript
// freeze.config.ts
import { defineConfig } from '@gravito/freeze'

export const freezeConfig = defineConfig({
  staticDomains: ['yourdomain.com', 'yourdomain.github.io'],
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  baseUrl: 'https://yourdomain.com',
  redirects: [
    { from: '/docs', to: '/en/docs/guide/getting-started' },
    { from: '/about', to: '/en/about' },
  ],
})
```

### 3. Setup Provider/Plugin

**React:**
```tsx
import { FreezeProvider } from '@gravito/freeze-react'
import { freezeConfig } from './freeze.config'

function App() {
  return (
    <FreezeProvider config={freezeConfig}>
      <Layout />
    </FreezeProvider>
  )
}
```

**Vue:**
```typescript
import { FreezePlugin } from '@gravito/freeze-vue'
import { freezeConfig } from './freeze.config'

app.use(FreezePlugin, freezeConfig)
```

### 4. Use StaticLink

**Never** use Inertia's `Link` directly:

```tsx
// ❌ Wrong
import { Link } from '@inertiajs/react'
<Link href="/about">About</Link>

// ✅ Correct
import { StaticLink } from '@gravito/freeze-react'
<StaticLink href="/about">About</StaticLink>
```

### 5. Use LocaleSwitcher

```tsx
import { LocaleSwitcher } from '@gravito/freeze-react'

<LocaleSwitcher locale="en">English</LocaleSwitcher>
<LocaleSwitcher locale="zh">中文</LocaleSwitcher>
```

### 6. Access Utilities via Hook/Composable

```tsx
import { useFreeze } from '@gravito/freeze-react'  // or freeze-vue

const {
  isStatic,         // boolean - static mode detection
  locale,           // string - current locale
  getLocalizedPath, // (path) => localized path
  switchLocale,     // (locale) => new path
  navigateToLocale, // (locale) => navigate
} = useFreeze()
```

## 📋 Standard Workflow

### For New Projects

```
1. Install  →  bun add @gravito/freeze-react (or freeze-vue)
2. Config   →  Create freeze.config.ts
3. Setup    →  Add FreezeProvider or FreezePlugin
4. Replace  →  Link → StaticLink everywhere
5. Build    →  bun run build:static
6. Test     →  bun run build:preview → localhost:4173
7. Deploy   →  GitHub Pages / Vercel / Netlify
```

### For Existing Projects

```
1. Install  →  bun add @gravito/freeze-react (or freeze-vue)
2. Config   →  Create freeze.config.ts
3. Audit    →  Find all Inertia Link usages
4. Replace  →  Link → StaticLink
5. Test     →  bun run build:preview
6. Deploy   →  Verify on production
```

## 🔍 Environment Detection

The `FreezeDetector` automatically detects environments:

| Environment | Port/Domain | Mode |
|-------------|-------------|------|
| Development | localhost:3000/5173 | **Dynamic** |
| Preview | localhost:4173 | **Static** |
| GitHub Pages | *.github.io | **Static** |
| Vercel | *.vercel.app | **Static** |
| Netlify | *.netlify.app | **Static** |
| Cloudflare | *.pages.dev | **Static** |
| Configured | staticDomains | **Static** |

## 🏗️ Build Script Integration

Use `@gravito/freeze` utilities in your build script:

```typescript
// build-static.ts
import {
  generateRedirects,
  generateLocalizedRoutes,
  generateSitemapEntries,
} from '@gravito/freeze'
import { freezeConfig } from './freeze.config'

// Generate localized routes
const routes = generateLocalizedRoutes(abstractRoutes, freezeConfig.locales)

// Generate redirect HTML files
const redirects = generateRedirects(freezeConfig)

// Generate sitemap with i18n alternates
const sitemap = generateSitemapEntries(routes, freezeConfig)
```

## 📊 Success Metrics

A static site is properly configured when:

- ✅ Using `@gravito/freeze-*` packages
- ✅ `freeze.config.ts` created with all domains
- ✅ All navigation uses `StaticLink`
- ✅ Locale switching works correctly
- ✅ Abstract routes redirect properly
- ✅ No black overlay on navigation
- ✅ No console errors
- ✅ Sitemap includes i18n alternates

## 🆘 Common Issues

| Issue | Cause | Solution |
|-------|-------|----------|
| Black overlay | Using Inertia `Link` | Use `StaticLink` |
| 404 on routes | Missing redirect | Add to `redirects` config |
| Wrong locale | Not using `getLocalizedPath()` | Wrap paths with function |
| Not detected as static | Domain not in config | Add to `staticDomains` |

## 📝 Changelog

### 2024-12 - @gravito/freeze Package Family

- Created `@gravito/freeze` core package
- Created `@gravito/freeze-react` adapter
- Created `@gravito/freeze-vue` adapter
- Unified SSG detection and navigation
- Built-in i18n support
- Comprehensive documentation

### 2024 - Initial Standardization

- Created static site development guides
- Implemented `StaticLink` components
- Established checklists and workflows

---

## 🎯 Golden Rules

1. **Install `@gravito/freeze-*`** - Use the official packages
2. **Create `freeze.config.ts`** - Centralized configuration
3. **Use `StaticLink`** - Never use Inertia `Link` directly
4. **Test with `build:preview`** - Always verify at localhost:4173
5. **Configure all redirects** - Prevent 404 errors

---

> 🧊 **Remember**: `@gravito/freeze` standardizes SSG across React and Vue!
