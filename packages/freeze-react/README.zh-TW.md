# @gravito/freeze-react

> @gravito/freeze 的 React 轉接器，提供 SSG 相關元件與 Hook。

## 安裝

```bash
bun add @gravito/freeze-react
```

## 快速開始

```tsx
import { FreezeProvider, defineConfig } from '@gravito/freeze-react'

const config = defineConfig({
  staticDomains: ['example.com', 'example.github.io'],
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  baseUrl: 'https://example.com',
})

function App() {
  return (
    <FreezeProvider config={config}>
      <Layout>...</Layout>
    </FreezeProvider>
  )
}
```
