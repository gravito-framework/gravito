# @gravito/freeze

> Gravito 的靜態網站生成核心模組，提供環境偵測與語系路由工具。

## 安裝

```bash
bun add @gravito/freeze
```

## 快速開始

```typescript
import { defineConfig, createDetector } from '@gravito/freeze'

const config = defineConfig({
  staticDomains: ['example.com', 'example.github.io'],
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  baseUrl: 'https://example.com',
  redirects: [
    { from: '/docs', to: '/en/docs/guide/getting-started' },
    { from: '/about', to: '/en/about' },
  ],
})

const detector = createDetector(config)

if (detector.isStaticSite()) {
  console.log('Using static mode - native <a> tags')
}
```
