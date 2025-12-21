# ✅ Static Site Development Checklist

Use this checklist when building static websites with Gravito + Inertia.js to ensure everything works correctly.

## 📋 Pre-Development

- [ ] Read [Static Site Development Guide](./en/guide/static-site-development.md)
- [ ] Understand the difference between dynamic and static navigation
- [ ] Know your production domain(s) for StaticLink configuration

## 🔧 Development Phase

### Component Setup

- [ ] Create `StaticLink` component (React or Vue)
- [ ] Configure `StaticLink` with your production domain(s)
- [ ] Replace all Inertia `Link` imports with `StaticLink` in navigation components
- [ ] Test `StaticLink` in development mode (should use Inertia Link)

### Navigation Components

- [ ] Header/Navbar uses `StaticLink`
- [ ] Footer links use `StaticLink`
- [ ] Mobile menu links use `StaticLink`
- [ ] Language switcher uses `StaticLink`
- [ ] Logo/home link uses `StaticLink`
- [ ] All internal page links use `StaticLink`

### Build Script

- [ ] `build-static.ts` builds client assets first
- [ ] All routes are discovered and included
- [ ] Static HTML generated for each route
- [ ] `404.html` generated with SPA routing script
- [ ] Static assets copied correctly
- [ ] GitHub Pages files created (CNAME, .nojekyll)

## 🏗️ Build Phase

### Build Execution

- [ ] `bun run build:client` succeeds
- [ ] `bun run build:static` succeeds
- [ ] No build errors or warnings
- [ ] Output directory (`dist-static/`) exists

### Output Verification

- [ ] `index.html` exists in output directory
- [ ] All route directories have `index.html`
- [ ] `404.html` exists and contains SPA script
- [ ] Static assets directory exists
- [ ] `CNAME` file exists (if using custom domain)
- [ ] `.nojekyll` file exists (for GitHub Pages)

## 🧪 Testing Phase

### Local Testing

- [ ] Serve static files locally (`npx serve dist-static` or similar)
- [ ] Test all navigation links
- [ ] Verify links navigate to correct pages
- [ ] Test 404 page for unknown routes
- [ ] Verify assets load correctly (CSS, JS, images)
- [ ] Test on different browsers (Chrome, Firefox, Safari)

### Production Testing

- [ ] Deploy to staging/production
- [ ] Test all navigation links on production domain
- [ ] Verify `StaticLink` detects production environment correctly
- [ ] Test 404 page on production
- [ ] Verify assets load correctly
- [ ] Test language switching (if applicable)
- [ ] Test mobile menu navigation

## 📚 Documentation

- [ ] Build process documented
- [ ] Deployment steps documented
- [ ] Team members informed about `StaticLink` usage
- [ ] Production domains documented in `StaticLink` component

## 🚀 Deployment

### Pre-Deployment

- [ ] All checklist items above completed
- [ ] Code reviewed
- [ ] Tests passing

### Deployment

- [ ] Static files uploaded to hosting provider
- [ ] GitHub Pages configured (if applicable)
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (if applicable)

### Post-Deployment

- [ ] Site accessible on production domain
- [ ] All navigation links work
- [ ] 404 page works
- [ ] Assets load correctly
- [ ] No console errors
- [ ] SEO meta tags correct (if applicable)

## 🔄 Maintenance

- [ ] Monitor for navigation issues
- [ ] Update `StaticLink` domains when adding new production domains
- [ ] Keep build script updated with new routes
- [ ] Document any platform-specific issues

---

## 🆘 Troubleshooting

If navigation doesn't work:

1. ✅ Check: Are you using `StaticLink` instead of Inertia's `Link`?
2. ✅ Check: Is your production domain in `StaticLink`'s static domains list?
3. ✅ Check: Is `404.html` generated with SPA routing script?
4. ✅ Check: Are all routes included in build script?

If assets don't load:

1. ✅ Check: Are asset paths correct?
2. ✅ Check: Is base path configured in Vite?
3. ✅ Check: Are static assets copied to output directory?

---

> **Remember**: Always use `StaticLink` for navigation in static sites. This is the most common source of issues.

