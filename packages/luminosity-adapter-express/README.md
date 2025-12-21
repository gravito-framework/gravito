# @gravito/luminosity-adapter-express

> Express/Koa adapter for Gravito SmartMap Engine.

Seamlessly integrate automatic Sitemap and Robots.txt generation into your Express applications.

## 📦 Installation

```bash
bun add @gravito/luminosity-adapter-express @gravito/luminosity
```

## 🚀 Usage

```typescript
import express from 'express';
import { SeoEngine } from '@gravito/luminosity';
import { expressSeo } from '@gravito/luminosity-adapter-express';

const app = express();
const engine = new SeoEngine();

// Middleware integration
app.use(expressSeo(engine));

app.listen(3000);
```

Check `@gravito/luminosity` documentation for engine configuration details.

## License

MIT
