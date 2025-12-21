# @gravito/luminosity-adapter-hono

> Hono adapter for Gravito SmartMap Engine.

Seamlessly integrate automatic Sitemap and Robots.txt generation into your Hono applications.

## 📦 Installation

```bash
bun add @gravito/luminosity-adapter-hono @gravito/luminosity
```

## 🚀 Usage

```typescript
import { Hono } from 'hono';
import { SeoEngine } from '@gravito/luminosity';
import { honoSeo } from '@gravito/luminosity-adapter-hono';

const app = new Hono();
const engine = new SeoEngine();

// Middleware integration
app.use('*', honoSeo(engine));

export default app;
```

Check `@gravito/luminosity` documentation for engine configuration details.

## License

MIT
