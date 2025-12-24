# @gravito/luminosity-adapter-hono

> Gravito SmartMap Engine 的 Hono 轉接器。

## 安裝

```bash
bun add @gravito/luminosity-adapter-hono @gravito/luminosity
```

## 快速開始

```typescript
import { Hono } from 'hono'
import { SeoEngine } from '@gravito/luminosity'
import { honoSeo } from '@gravito/luminosity-adapter-hono'

const app = new Hono()
const engine = new SeoEngine()

app.use('*', honoSeo(engine))
```
