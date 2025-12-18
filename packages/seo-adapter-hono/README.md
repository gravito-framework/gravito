# @gravito/seo-adapter-hono

> Hono adapter for Gravito SmartMap Engine.

Seamlessly integrate automatic Sitemap and Robots.txt generation into your Hono applications.

## 📦 Installation

```bash
bun add @gravito/seo-adapter-hono @gravito/seo-core
```

## 🚀 Usage

```typescript
import { Hono } from 'hono';
import { SeoEngine } from '@gravito/seo-core';
import { honoSeo } from '@gravito/seo-adapter-hono';

const app = new Hono();
const engine = new SeoEngine();

// Middleware integration
app.use('*', honoSeo(engine));

export default app;
```

Check `@gravito/seo-core` documentation for engine configuration details.

## License

MIT
