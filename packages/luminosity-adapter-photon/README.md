# @gravito/luminosity-adapter-photon

> Photon adapter for Gravito SmartMap Engine.

Seamlessly integrate automatic Sitemap and Robots.txt generation into your Photon applications.

## 📦 Installation

```bash
bun add @gravito/luminosity-adapter-photon @gravito/luminosity
```

## 🚀 Usage

```typescript
import { Photon } from '@gravito/photon';
import { SeoEngine } from '@gravito/luminosity';
import { gravitoSeo } from '@gravito/luminosity-adapter-photon';

const app = new Photon();
const engine = new SeoEngine();

// Middleware integration
app.use('*', gravitoSeo(engine));

export default app;
```

Check `@gravito/luminosity` documentation for engine configuration details.

## License

MIT
