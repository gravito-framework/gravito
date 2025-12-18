# @gravito/seo-adapter-express

> Express/Koa adapter for Gravito SmartMap Engine.

Seamlessly integrate automatic Sitemap and Robots.txt generation into your Express applications.

## 📦 Installation

```bash
bun add @gravito/seo-adapter-express @gravito/seo-core
```

## 🚀 Usage

```typescript
import express from 'express';
import { SeoEngine } from '@gravito/seo-core';
import { expressSeo } from '@gravito/seo-adapter-express';

const app = express();
const engine = new SeoEngine();

// Middleware integration
app.use(expressSeo(engine));

app.listen(3000);
```

Check `@gravito/seo-core` documentation for engine configuration details.

## License

MIT
