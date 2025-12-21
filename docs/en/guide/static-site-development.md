# 🌐 Static Site Development Guide

Complete guide for building static websites with Gravito + Inertia.js (React/Vue) for deployment on GitHub Pages, Vercel, Netlify, and other static hosting platforms.

## 📋 Table of Contents

1. [Overview](#overview)
2. [Common Pitfalls](#common-pitfalls)
3. [Standard Development Workflow](#standard-development-workflow)
4. [React Implementation](#react-implementation)
5. [Vue Implementation](#vue-implementation)
6. [Build & Deployment](#build--deployment)
7. [Checklist](#checklist)

---

## 🎯 Overview

When building static websites with Inertia.js, you must handle navigation differently than in dynamic applications:

- **Dynamic Apps**: Inertia's `Link` component uses AJAX requests to fetch page data from the backend
- **Static Sites**: No backend server exists, so links must use full page navigation

This guide ensures your static sites work correctly on all hosting platforms.

---

## ⚠️ Common Pitfalls

### 1. **Inertia Link in Static Environment**

**Problem**: Using Inertia's `Link` component in static sites causes navigation failures because there's no backend to handle AJAX requests.

**Symptom**: Clicking links shows popup effects or doesn't navigate properly.

**Solution**: Use `StaticLink` component that automatically detects the environment and uses appropriate navigation method.

### 2. **Missing 404.html for GitHub Pages**

**Problem**: GitHub Pages doesn't support client-side routing by default.

**Solution**: Generate `404.html` with SPA routing support in your build script.

### 3. **Incorrect Base Path Configuration**

**Problem**: Assets and routes don't work when site is deployed to a subdirectory.

**Solution**: Configure base path in Vite and ensure all paths are relative or use environment variables.

---

## 🔄 Standard Development Workflow

### Step 1: Project Setup

```bash
# Create new project
bun create gravito-app my-static-site

# Install dependencies
bun install
```

### Step 2: Use StaticLink Component

**Never use Inertia's `Link` directly in static sites.** Always use `StaticLink`:

```tsx
// ❌ Wrong
import { Link } from '@inertiajs/react'
<Link href="/about">About</Link>

// ✅ Correct
import { StaticLink } from '@/components/StaticLink'
<StaticLink href="/about">About</StaticLink>
```

### Step 3: Build Script Configuration

Ensure your `build-static.ts` includes:

1. ✅ Client asset building
2. ✅ Static HTML generation for all routes
3. ✅ 404.html generation with SPA support
4. ✅ Static asset copying
5. ✅ CNAME/.nojekyll for GitHub Pages

### Step 4: Pre-deployment Testing

Before deploying, test locally:

```bash
# Build static site
bun run build:static

# Serve locally (using a simple HTTP server)
cd dist-static
python3 -m http.server 8000
# or
npx serve dist-static

# Test all navigation links
# Verify 404.html works for unknown routes
```

---

## ⚛️ React Implementation

### StaticLink Component

Create `src/client/components/StaticLink.tsx`:

```tsx
import { Link } from '@inertiajs/react'
import type { LinkProps } from '@inertiajs/react'
import type React from 'react'

/**
 * Detect if running in static site environment
 */
function isStaticSite(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const hostname = window.location.hostname
  // Add your production domains here
  const staticDomains = [
    'gravito.dev',
    'yourdomain.com',
    // Add GitHub Pages pattern if needed
    // hostname.includes('github.io')
  ]

  return staticDomains.includes(hostname)
}

interface StaticLinkProps extends LinkProps {
  children: React.ReactNode
  className?: string
}

/**
 * Smart Link component that uses full page navigation in static sites
 * and Inertia navigation in dynamic environments
 */
export function StaticLink({ href, children, className, onClick, ...props }: StaticLinkProps) {
  const isStatic = isStaticSite()

  if (isStatic) {
    return (
      <a
        href={href as string}
        className={className}
        onClick={(e) => {
          if (onClick) onClick(e as any)
          // Let browser handle navigation in static mode
        }}
        {...(props as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'onClick'>)}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={className} onClick={onClick} {...props}>
      {children}
    </Link>
  )
}
```

### Usage in Components

```tsx
import { StaticLink } from '@/components/StaticLink'

export function Navigation() {
  return (
    <nav>
      <StaticLink href="/">Home</StaticLink>
      <StaticLink href="/about">About</StaticLink>
      <StaticLink href="/docs">Docs</StaticLink>
    </nav>
  )
}
```

---

## 🟢 Vue Implementation

### StaticLink Component

Create `src/client/components/StaticLink.vue`:

```vue
<template>
  <component :is="linkComponent" v-bind="linkProps">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { computed } from 'vue'

interface Props {
  href: string
  as?: string
  method?: string
  data?: Record<string, any>
  replace?: boolean
  preserveScroll?: boolean
  preserveState?: boolean
  only?: string[]
  except?: string[]
  headers?: Record<string, string>
  queryStringArrayFormat?: 'brackets' | 'indices'
  [key: string]: any
}

const props = defineProps<Props>()

/**
 * Detect if running in static site environment
 */
function isStaticSite(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const hostname = window.location.hostname
  const staticDomains = [
    'gravito.dev',
    'yourdomain.com',
    // Add your production domains
  ]

  return staticDomains.includes(hostname)
}

const isStatic = isStaticSite()

const linkComponent = computed(() => {
  return isStatic ? 'a' : Link
})

const linkProps = computed(() => {
  if (isStatic) {
    // For static sites, use plain <a> tag
    const { href, ...rest } = props
    return {
      href,
      ...rest,
    }
  }

  // For dynamic sites, use Inertia Link
  return props
})
</script>
```

### Usage in Components

```vue
<template>
  <nav>
    <StaticLink href="/">Home</StaticLink>
    <StaticLink href="/about">About</StaticLink>
    <StaticLink href="/docs">Docs</StaticLink>
  </nav>
</template>

<script setup lang="ts">
import StaticLink from '@/components/StaticLink.vue'
</script>
```

---

## 🏗️ Build & Deployment

### Build Script Requirements

Your `build-static.ts` must include:

```typescript
// 1. Build client assets
await execAsync('bun run build:client')

// 2. Initialize core (without starting server)
const core = await bootstrap({ port: 3000 })

// 3. Generate static HTML for all routes
for (const route of routes) {
  const res = await core.app.request(route)
  const html = await res.text()
  await writeFile(join(outputDir, route, 'index.html'), html)
}

// 4. Generate 404.html with SPA routing support
const spaScript = `
<script>
  // GitHub Pages SPA routing handler
  (function() {
    const currentPath = window.location.pathname;
    // ... SPA routing logic
  })();
</script>`
await writeFile(join(outputDir, '404.html'), htmlWithScript)

// 5. Copy static assets
await cp(staticDir, join(outputDir, 'static'), { recursive: true })

// 6. Create GitHub Pages files
await writeFile(join(outputDir, 'CNAME'), 'yourdomain.com')
await writeFile(join(outputDir, '.nojekyll'), '')
```

### GitHub Pages Deployment

1. Build static site: `bun run build:static`
2. Commit `dist-static/` to `gh-pages` branch or deploy via GitHub Actions
3. Configure GitHub Pages to serve from `gh-pages` branch or `dist-static/` folder

### Vercel/Netlify Deployment

These platforms handle SPA routing automatically, but still use `StaticLink` for consistency:

1. Build: `bun run build:static`
2. Output directory: `dist-static`
3. Deploy via CLI or Git integration

---

## ✅ Checklist

Before deploying a static site, verify:

### Development
- [ ] All navigation links use `StaticLink` (not Inertia's `Link`)
- [ ] `StaticLink` component detects your production domain correctly
- [ ] All routes are included in build script
- [ ] 404.html is generated with SPA routing support

### Build
- [ ] Client assets build successfully
- [ ] All routes generate valid HTML files
- [ ] Static assets are copied correctly
- [ ] 404.html exists and includes SPA script
- [ ] CNAME/.nojekyll files exist (for GitHub Pages)

### Testing
- [ ] Test all navigation links locally
- [ ] Test 404 page for unknown routes
- [ ] Verify assets load correctly
- [ ] Test on production domain after deployment

### Documentation
- [ ] Build process is documented
- [ ] Deployment steps are clear
- [ ] Team members know to use `StaticLink`

---

## 🔧 Troubleshooting

### Links Don't Navigate

**Check**: Are you using `StaticLink` instead of Inertia's `Link`?

**Fix**: Replace all `Link` imports with `StaticLink` in navigation components.

### 404 Page Doesn't Work

**Check**: Is `404.html` generated with SPA routing script?

**Fix**: Ensure build script includes SPA routing handler in 404.html.

### Assets Not Loading

**Check**: Are asset paths correct? Is base path configured?

**Fix**: Verify Vite `base` config and ensure all paths are relative or use environment variables.

---

## 📚 Related Guides

- [Deployment Guide](./deployment.md)
- [Inertia React Guide](./inertia-react.md)
- [SEO Engine Guide](./seo-engine.md)

---

> **Remember**: Always use `StaticLink` for navigation in static sites. This ensures your site works correctly on all static hosting platforms.

