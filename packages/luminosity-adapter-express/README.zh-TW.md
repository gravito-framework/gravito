# @gravito/luminosity-adapter-express

> Gravito SmartMap Engine 的 Express/Koa 轉接器。

## 安裝

```bash
bun add @gravito/luminosity-adapter-express @gravito/luminosity
```

## 快速開始

```typescript
import express from 'express'
import { SeoEngine } from '@gravito/luminosity'
import { expressSeo } from '@gravito/luminosity-adapter-express'

const app = express()
const engine = new SeoEngine()

app.use(expressSeo(engine))

app.listen(3000)
```
