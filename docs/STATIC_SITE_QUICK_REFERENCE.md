# 🚀 Static Site Quick Reference

Quick reference guide for building static sites with Gravito + Inertia.js.

## ⚡ TL;DR

**Always use `StaticLink` instead of Inertia's `Link` in static sites.**

```tsx
// ❌ Wrong
import { Link } from '@inertiajs/react'
<Link href="/about">About</Link>

// ✅ Correct
import { StaticLink } from '@/components/StaticLink'
<StaticLink href="/about">About</StaticLink>
```

## 📦 Component Location

- **React**: `src/client/components/StaticLink.tsx`
- **Vue**: `src/client/components/StaticLink.vue`

## 🔧 Configuration

Update the `staticDomains` array in `StaticLink` component with your production domains:

```typescript
const staticDomains = [
  'yourdomain.com',
  'www.yourdomain.com',
  // Add all your production domains
]
```

## ✅ Checklist

Before deploying:

- [ ] All navigation uses `StaticLink`
- [ ] Production domains configured in `StaticLink`
- [ ] `404.html` generated with SPA script
- [ ] Tested locally before deployment

## 📚 Full Documentation

- [Static Site Development Guide](./en/guide/static-site-development.md)
- [Static Site Checklist](./STATIC_SITE_CHECKLIST.md)
- [Deployment Guide](./en/guide/deployment.md)

## 🆘 Common Issues

### Links don't navigate
→ Check: Using `StaticLink` instead of `Link`?

### 404 page doesn't work
→ Check: `404.html` generated with SPA script?

### Assets don't load
→ Check: Base path configured in Vite?

---

> **Remember**: `StaticLink` = Static sites, `Link` = Dynamic apps

