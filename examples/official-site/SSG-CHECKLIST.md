# 🧊 Gravito SSG Deployment Checklist

Quick reference checklist for deploying static sites with `@gravito/freeze`.

---

## ⚙️ Configuration

```typescript
// freeze.config.ts
import { defineConfig } from '@gravito/freeze'

export const freezeConfig = defineConfig({
  staticDomains: ['your-domain.com'],
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  baseUrl: 'https://your-domain.com',
  redirects: [
    { from: '/docs', to: '/en/docs/guide/getting-started' },
    { from: '/about', to: '/en/about' },
  ],
})
```

---

## ✅ Pre-Deploy Checklist

### 1. Configuration
- [ ] `freeze.config.ts` exists with correct settings
- [ ] All production domains in `staticDomains`
- [ ] All locales defined in `locales`
- [ ] All abstract routes in `redirects`
- [ ] Correct `baseUrl` for production

### 2. Components
- [ ] All `<Link>` replaced with `<StaticLink>`
- [ ] `StaticLink` uses `detector.getLocalizedPath()`
- [ ] Locale switcher uses `detector.switchLocale()`

### 3. Paths
- [ ] All internal links have locale prefix (`/en/...`, `/zh/...`)
- [ ] No hardcoded paths without locale

### 4. Build & Test
- [ ] `bun run build:static` completes without errors
- [ ] `bun run build:preview` runs successfully
- [ ] Tested at http://localhost:4173
- [ ] ✓ No black overlay on link clicks
- [ ] ✓ Language switching works
- [ ] ✓ Abstract routes redirect correctly
- [ ] ✓ No console errors

### 5. Assets
- [ ] All images load correctly
- [ ] CSS styles applied
- [ ] JavaScript bundles load

### 6. SEO
- [ ] `sitemap.xml` generated
- [ ] `robots.txt` generated
- [ ] Meta tags present on all pages

---

## 🚀 Quick Commands

```bash
# Install
bun add @gravito/freeze

# Build static site
bun run build:static

# Preview locally
bun run preview

# Build + Preview
bun run build:preview
```

---

## 🔍 Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| Black overlay on click | Using Inertia `<Link>` | Replace with `<StaticLink>` |
| 404 on routes | Missing locale prefix | Use `getLocalizedPath()` |
| Double locale prefix | Incorrect switcher | Use `switchLocale()` |
| Redirect loop | Missing redirect HTML | Add to `redirects` config |

---

## 📁 Expected Output Structure

```
dist-static/
├── index.html              ← Redirect to /en
├── 404.html
├── sitemap.xml
├── robots.txt
├── en/
│   ├── index.html
│   ├── about/index.html
│   └── docs/...
├── zh/
│   ├── index.html
│   ├── about/index.html
│   └── docs/...
├── about/index.html        ← Redirect to /en/about
├── docs/index.html         ← Redirect to /en/docs/...
└── assets/
    ├── *.js
    └── *.css
```

---

## 🎯 Golden Rules

1. **Always use `StaticLink`** - Never use raw Inertia `<Link>`
2. **Always localize paths** - Use `getLocalizedPath()` for all internal links
3. **Always test before deploy** - Run `bun run build:preview`
4. **Always add redirects** - Configure abstract routes in `freeze.config.ts`

---

Ready to deploy? Run `bun run build:static` and ship it! 🚀
