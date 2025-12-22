# 🚀 Static Site Generation (SSG) Quick Checklist

Before deploying your Gravito site as a static website, run through this checklist.

## ✅ Pre-Build Checklist

### Links & Navigation
- [ ] Use `StaticLink` instead of Inertia `Link` for all internal links
- [ ] All paths include locale prefix (`/en/...` or `/zh/...`)
- [ ] Locale switcher strips old prefix before adding new one

### Build Configuration  
- [ ] Abstract routes (`/`, `/about`, `/docs`) have redirect HTML in `build-static.ts`
- [ ] `isStaticSite()` function includes your deployment domain

### Testing
- [ ] Run `bun run build:preview` 
- [ ] Test at http://localhost:4173
- [ ] Click sidebar links → No new tabs, no black overlay
- [ ] Switch languages → URL updates correctly (no `/zh/en/...`)
- [ ] Navigate to `/about` → Redirects to `/en/about`

## 🔧 Quick Fixes

### Black overlay on navigation?
```tsx
// Change this:
import { Link } from '@inertiajs/react'
<Link href="/docs">Docs</Link>

// To this:
import { StaticLink } from '../components/StaticLink'
<StaticLink href="/docs">Docs</StaticLink>
```

### Missing locale in sidebar links?
```typescript
// In DocsService.ts, change:
const prefix = locale === 'zh' ? '/zh/docs' : '/docs'
// To:
const prefix = locale === 'zh' ? '/zh/docs' : '/en/docs'
```

### Language switch produces wrong URL?
```typescript
// Strip existing prefix first:
let path = window.location.pathname
if (path.startsWith('/en')) path = path.replace(/^\/en/, '') || '/'
if (path.startsWith('/zh')) path = path.replace(/^\/zh/, '') || '/'
// Then add new prefix
```

---

📚 Full documentation: `/docs/guide/static-site-development`
