# @gravito/seo-core

The intelligent core of the Gravito SmartMap Engine™. Provides incremental sitemap generation, robots.txt management, and dynamic meta tag building.

## Features

- **Tri-Mode Architecture**: Dynamic, Cached (Mutex), and Incremental (LSM) modes.
- **Sitemap Generation**: High-performance XML stream builder.
- **Robots.txt**: Programmable crawler directives.
- **Meta Tags**: Builder for Meta, OpenGraph, Twitter Cards, and JSON-LD.
- **Framework Agnostic**: Core logic decoupled from HTTP layers.

## Installation

```bash
bun add @gravito/seo-core
```

## Configuration

The engine is controlled via a `SeoConfig` object, typically defined in `gravito.seo.config.ts`.

### Basic Config
```typescript
import type { SeoConfig } from '@gravito/seo-core';

const config: SeoConfig = {
  mode: 'cached', // 'dynamic' | 'cached' | 'incremental'
  baseUrl: 'https://example.com',
  resolvers: [ /* ... */ ]
};
```

### Robots.txt Configuration
You can define `robots.txt` rules directly in your config:

```typescript
const config: SeoConfig = {
  // ...
  robots: {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/admin', '/private']
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/']
      }
    ],
    // Optional: Defaults to sitemap.xml
    sitemapUrls: ['https://example.com/sitemap.xml'],
    host: 'example.com'
  }
};
```

When using `gravito-seo` middleware (in Hono/Express), requests to `/robots.txt` will automatically serve this generated content.

## usage

### 1. Sitemap Engine
Typically used via `@gravito/seo-adapter-hono` or `@gravito/seo-adapter-express`.

### 2. Meta Tags (SeoMetadata)
Use `SeoMetadata` in your controllers or views to generate HTML head tags dynamically.

```typescript
import { SeoMetadata } from '@gravito/seo-core';

// In your controller/route
const post = { title: "Hello World", summary: "..." };

const seo = new SeoMetadata({
  meta: {
    title: post.title,
    description: post.summary,
    canonical: 'https://example.com/post/hello-world',
    keywords: ['gravito', 'seo']
  },
  og: {
    title: post.title, // Fallback to meta.title if omitted
    type: 'article',
    image: 'https://example.com/cover.jpg'
  },
  twitter: {
    card: 'summary_large_image'
  },
  jsonLd: {
    type: 'Article',
    data: {
      headline: post.title,
      author: {
        '@type': 'Person',
        name: 'Carl Lee'
      }
    }
  }
});

// Inject into template
const headHtml = seo.toString();
```

**Output:**
```html
<title>Hello World</title>
<meta name="description" content="...">
<link rel="canonical" href="...">
<meta property="og:title" content="Hello World">
<meta property="og:type" content="article">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">{"@context":"...","@type":"Article",...}</script>
```

### 3. RobotsBuilder (Direct Usage)
If you need to generate robots.txt manually:

```typescript
import { RobotsBuilder } from '@gravito/seo-core';

const builder = new RobotsBuilder({
  rules: [{ userAgent: '*', disallow: ['/'] }]
}, 'https://example.com');

console.log(builder.build());
```
