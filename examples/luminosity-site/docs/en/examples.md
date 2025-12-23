---
title: Usage Examples
order: 5
---

# Usage Examples

Explore common patterns and best practices for integrating Luminosity into your application.

## 1. Basic Static Sitemap

For small sites or static content, you can provide a simple array of URLs.

```typescript
import { Luminosity } from '@gravito/luminosity'

const engine = new Luminosity({
  path: './public',
  hostname: 'https://mysite.com'
})

// Define static entries
const entries = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/about', changefreq: 'monthly', priority: 0.8 },
  { url: '/contact', changefreq: 'yearly', priority: 0.5 }
]

// Generate sitemap.xml
await engine.generate(entries)
```

## 2. Streaming from Database (High Performance)

For large datasets (e.g., e-commerce products, user profiles), use **Async Iterators**. This allows Luminosity to process millions of records with constant memory usage.

```typescript
import { Luminosity } from '@gravito/luminosity'
import { db } from './my-database' // Your DB client

const engine = new Luminosity({
  path: './public',
  hostname: 'https://shop.com'
})

// Generator function yields records one by one
async function* getProductEntries() {
  const stream = db.select('slug', 'updated_at').from('products').stream()
  
  for await (const product of stream) {
    yield {
      url: `/product/${product.slug}`,
      lastmod: product.updated_at, // ISO 8601 string or Date object
      changefreq: 'weekly'
    }
  }
}

// Luminosity consumes the stream directly
await engine.generate(getProductEntries())
```

## 3. Integration with Hono

Luminosity works perfectly with modern edge frameworks like Hono.

```typescript
import { Hono } from 'hono'
import { Luminosity } from '@gravito/luminosity'
import { serveStatic } from 'hono/bun'

const app = new Hono()
const lux = new Luminosity({ path: './dist' })

// 1. Generate on startup (or via cron)
await lux.generate(myEntries)

// 2. Serve the generated files
app.use('/sitemap*.xml', serveStatic({ root: './dist' }))
app.use('/robots.txt', serveStatic({ root: './dist' }))

// 3. (Optional) Dynamic Robots.txt control
app.get('/robots.txt', (c) => {
  return c.text(lux.robots().allow('*').build())
})

export default app
```

## 4. Multi-Language (i18n)

Handle localized versions of your pages using alternate links.

```typescript
const entries = [
  { 
    url: '/en/home', 
    links: [
      { lang: 'en', url: 'https://site.com/en/home' },
      { lang: 'fr', url: 'https://site.com/fr/home' },
      { lang: 'zh', url: 'https://site.com/zh/home' }
    ]
  }
]

await engine.generate(entries)
```
