# 📐 Static Site Development Standardization

This document outlines the standardized approach for building static websites with Gravito + Inertia.js (React/Vue) to prevent common issues and ensure consistent quality across all brand websites.

## 🎯 Purpose

After experiencing navigation issues in static site deployments, we've established a standardized workflow to ensure:

1. ✅ Consistent navigation behavior across all static sites
2. ✅ Support for both React and Vue frameworks
3. ✅ Clear documentation and checklists
4. ✅ Reusable components and templates
5. ✅ Prevention of common pitfalls

## 📚 Documentation Structure

### Core Guides

1. **[Static Site Development Guide (English)](./en/guide/static-site-development.md)**
   - Complete guide for React and Vue implementations
   - Common pitfalls and solutions
   - Build and deployment instructions

2. **[Static Site Development Guide (繁體中文)](./zh-TW/guide/static-site-development.md)**
   - 完整的 React 和 Vue 實作指南
   - 常見陷阱和解決方案
   - 建置與部署說明

3. **[Static Site Checklist](./STATIC_SITE_CHECKLIST.md)**
   - Step-by-step checklist for development, build, and deployment
   - Troubleshooting guide
   - Pre-deployment verification

4. **[Quick Reference](./STATIC_SITE_QUICK_REFERENCE.md)**
   - TL;DR version for quick lookups
   - Common issues and solutions
   - Links to full documentation

### Updated Guides

- **[Deployment Guide (English)](./en/guide/deployment.md)** - Updated with static site best practices
- **[Deployment Guide (繁體中文)](./zh-TW/guide/deployment.md)** - 已更新靜態網站最佳實踐

## 🧩 Reusable Components

### React

**Location**: `examples/official-site/src/client/components/StaticLink.tsx`

**Template Location**: Can be copied to any React project

**Usage**:
```tsx
import { StaticLink } from '@/components/StaticLink'

<StaticLink href="/about">About</StaticLink>
```

### Vue

**Location**: `templates/inertia-vue/src/client/components/StaticLink.vue`

**Usage**:
```vue
<template>
  <StaticLink href="/about">About</StaticLink>
</template>

<script setup lang="ts">
import StaticLink from '@/components/StaticLink.vue'
</script>
```

## 🔑 Key Principles

### 1. Always Use StaticLink

**Never** use Inertia's `Link` component directly in static sites:

```tsx
// ❌ Wrong
import { Link } from '@inertiajs/react'
<Link href="/about">About</Link>

// ✅ Correct
import { StaticLink } from '@/components/StaticLink'
<StaticLink href="/about">About</StaticLink>
```

### 2. Configure Production Domains

Update `staticDomains` array in `StaticLink` component:

```typescript
const staticDomains = [
  'yourdomain.com',
  'www.yourdomain.com',
  // Add all production domains
]
```

### 3. Generate 404.html

Ensure build script generates `404.html` with SPA routing support for GitHub Pages.

### 4. Test Before Deploy

Always test static site locally before deploying:

```bash
bun run build:static
cd dist-static
npx serve .
# Test all navigation links
```

## 📋 Standard Workflow

### For New Static Sites

1. **Setup**
   - Copy `StaticLink` component (React or Vue)
   - Configure production domains
   - Read [Static Site Development Guide](./en/guide/static-site-development.md)

2. **Development**
   - Use `StaticLink` for all navigation
   - Follow [Static Site Checklist](./STATIC_SITE_CHECKLIST.md)
   - Test in development mode

3. **Build**
   - Ensure build script includes all routes
   - Generate `404.html` with SPA support
   - Verify output directory structure

4. **Deploy**
   - Test locally first
   - Deploy to staging
   - Verify all navigation works
   - Deploy to production

### For Existing Sites

1. **Audit**
   - Find all uses of Inertia's `Link` component
   - Replace with `StaticLink`
   - Update production domains in `StaticLink`

2. **Test**
   - Build static site
   - Test all navigation
   - Fix any issues

3. **Deploy**
   - Follow standard deployment process
   - Monitor for navigation issues

## 🎓 Training & Onboarding

When onboarding new team members or starting new static site projects:

1. Share [Static Site Development Guide](./en/guide/static-site-development.md)
2. Review [Static Site Checklist](./STATIC_SITE_CHECKLIST.md)
3. Demonstrate `StaticLink` usage
4. Explain why it's necessary (no backend in static sites)

## 🔄 Maintenance

### When Adding New Production Domains

1. Update `staticDomains` in `StaticLink` component
2. Update documentation if needed
3. Test on new domain

### When Adding New Routes

1. Ensure route is included in build script
2. Test route navigation
3. Verify route generates valid HTML

### When Updating Build Script

1. Ensure `404.html` still generated with SPA script
2. Verify static assets still copied
3. Test build output

## 📊 Success Metrics

A static site is considered properly configured when:

- ✅ All navigation uses `StaticLink`
- ✅ All links navigate correctly on production
- ✅ 404 page works for unknown routes
- ✅ No console errors related to navigation
- ✅ Assets load correctly
- ✅ Works on all target browsers

## 🆘 Support

If you encounter issues:

1. Check [Static Site Checklist](./STATIC_SITE_CHECKLIST.md)
2. Review [Troubleshooting section](./en/guide/static-site-development.md#-troubleshooting)
3. Verify `StaticLink` configuration
4. Check build script output

## 📝 Changelog

### 2024 - Initial Standardization

- Created comprehensive static site development guide
- Implemented `StaticLink` component for React and Vue
- Established checklists and workflows
- Updated deployment documentation

---

> **Remember**: Standardization prevents issues. Always follow the established workflow for static sites.

