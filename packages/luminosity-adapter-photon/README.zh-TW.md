# @gravito/luminosity-adapter-photon

> Gravito SmartMap Engine 的 Photon 轉接器。

## 安裝

```bash
bun add @gravito/luminosity-adapter-photon @gravito/luminosity
```

## 快速開始

```typescript
import { Photon } from '@gravito/photon'
import { SeoEngine } from '@gravito/luminosity'
import { gravitoSeo } from '@gravito/luminosity-adapter-photon'

const app = new Photon()
const engine = new SeoEngine()

app.use('*', gravitoSeo(engine))
```
