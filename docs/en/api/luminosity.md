---
title: Luminosity
description: API reference for Gravito's SEO and Sitemap integration.
---

# Luminosity

The `@gravito/luminosity-adapter-photon` (or simply `OrbitLuminosity`) provides a seamless integration between Gravito's core and the SEO engine.

## Installation

```bash
bun add @gravito/luminosity @gravito/luminosity-adapter-photon
```

## Basic Usage

The Luminosity module registers a middleware that handles `/sitemap.xml` and `/robots.txt` automatically.

```typescript
import { gravitoSeo } from '@gravito/luminosity-adapter-photon'
import { seoConfig } from './config/seo'

// In your bootstrap or index
app.use('*', gravitoSeo(seoConfig))
```

## `SeoConfig` Interface

| Property | Type | Description |
|----------|------|-------------|
| `mode` | `'dynamic' \| 'cached' \| 'incremental'` | The SEO strategy to use. |
| `baseUrl` | `string` | The base URL for all absolute links. |
| `resolvers` | `SeoResolver[]` | Dynamic URL generators. |
| `robots` | `RobotsConfig` | Rules for robots.txt. |
| `analytics` | `AnalyticsConfig` | Config for GA, Pixel, etc. |

## Dynamic Resolvers

Resolvers are the most powerful part of Luminosity. They allow you to fetch URLs from any source (DB, FS, etc.)

```typescript
const postsResolver = {
  name: 'posts',
  fetch: async () => {
    const posts = await db.posts.findMany()
    return posts.map(p => ({
      url: `/post/${p.slug}`,
      lastmod: p.updatedAt,
      priority: 0.8
    }))
  }
}
```

## Analytics Builder

The engine generates professional, non-blocking script tags for:
- **Google Analytics** (`gtag`)
- **Meta Pixel** (`pixel`)
- **Baidu Tongji** (`baidu`)

These are injected via the `SeoMetadata` utility used in your controllers.

## RouteScanner (Cross-Framework Support)

Luminosity includes a powerful **RouteScanner** system that automatically discovers routes from various frameworks. This means you can use Luminosity even if you're not using Gravito!

### Supported Frameworks

| Framework | Scanner | Route Discovery |
|-----------|---------|-----------------|
| **Gravito** | `GravitoScanner` | `core.router.routes` |
| **Hono** | `HonoScanner` | `app.routes` |
| **Express** | `ExpressScanner` | `app._router.stack` |
| **Next.js** | `NextScanner` | File system (`app/`, `pages/`) |
| **Nuxt** | `NuxtScanner` | File system (`pages/`) |

### Usage with Hono

```typescript
import { Hono } from 'hono'
import { SitemapBuilder, HonoScanner } from '@gravito/luminosity'

const app = new Hono()
app.get('/hello', (c) => c.text('Hello'))
app.get('/blog/:slug', (c) => c.text('Blog'))

const builder = new SitemapBuilder({
  scanner: new HonoScanner(app),
  hostname: 'https://example.com',
  dynamicResolvers: [
    {
      pattern: '/blog/:slug',
      resolve: async () => {
        const posts = await getPosts()
        return posts.map(p => ({ slug: p.slug }))
      }
    }
  ]
})

const entries = await builder.build()
```

### Usage with Next.js

```typescript
// app/sitemap.ts
import { SitemapBuilder, NextScanner } from '@gravito/luminosity'

export default async function sitemap() {
  const builder = new SitemapBuilder({
    scanner: new NextScanner({ appDir: './app' }),
    hostname: 'https://example.com'
  })

  return builder.build()
}
```

### Creating Custom Scanners

You can create scanners for any framework by implementing the `RouteScanner` interface:

```typescript
import type { RouteScanner, ScannedRoute } from '@gravito/luminosity'

class MyFrameworkScanner implements RouteScanner {
  readonly framework = 'my-framework'

  async scan(): Promise<ScannedRoute[]> {
    // Your route discovery logic here
    return [
      { path: '/', method: 'GET', isDynamic: false },
      { path: '/blog/:slug', method: 'GET', isDynamic: true, params: ['slug'] }
    ]
  }
}
```
