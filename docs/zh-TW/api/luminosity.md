---
title: Luminosity
description: Gravito SEO 與 Sitemap 整合的 API 參考。
---

# Luminosity

`@gravito/luminosity-adapter-photon` (簡稱為 `OrbitLuminosity`) 提供了 Gravito 核心與 SEO 引擎之間的無縫整合。

## 安裝

```bash
bun add @gravito/luminosity @gravito/luminosity-adapter-photon
```

## 基礎用法

SEO 動力模組會註冊一個中間件，自動處理 `/sitemap.xml` 與 `/robots.txt`。

```typescript
import { gravitoSeo } from '@gravito/luminosity-adapter-photon'
import { seoConfig } from './config/seo'

// 在 bootstrap 或 index 中使用
app.use('*', gravitoSeo(seoConfig))
```

## `SeoConfig` 介面

| 屬性 | 類型 | 描述 |
|----------|------|-------------|
| `mode` | `'dynamic' \| 'cached' \| 'incremental'` | 使用的 SEO 策略。 |
| `baseUrl` | `string` | 所有絕對連結的基準 URL。 |
| `resolvers` | `SeoResolver[]` | 動態網址生成器。 |
| `robots` | `RobotsConfig` | robots.txt 的規則。 |
| `analytics` | `AnalyticsConfig` | GA、Pixel 等追蹤設定。 |

## 動態解析器 (Dynamic Resolvers)

解析器是 Luminosity 最強大的部分。它們允許您從任何來源（資料庫、檔案系統等）獲取網址。

```typescript
const postsResolver = {
  name: 'posts',
  fetch: async () => {
    const posts = await db.posts.findMany()
    return posts.map(p => ({
      url: `/post/${p.slug}`,
      lastmod: p.updatedAt,
      priority: 0.8
    }))
  }
}
```

## 分析工具建構器 (Analytics Builder)

引擎會生成專業、非阻塞的腳本標籤，支援：
- **Google Analytics** (`gtag`)
- **Meta Pixel** (`pixel`)
- **百度統計** (`baidu`)

這些內容會透過您在控制器中使用的 `SeoMetadata` 工具自動注入。

## 路由掃描器 (跨框架支援)

Luminosity 內建強大的 **RouteScanner** 系統，能自動發現來自各種框架的路由。這意味著即使您不使用 Gravito，也能使用 Luminosity！

### 支援的框架

| 框架 | 掃描器 | 路由發現方式 |
|------|--------|-------------|
| **Gravito** | `GravitoScanner` | `core.router.routes` |
| **Hono** | `HonoScanner` | `app.routes` |
| **Express** | `ExpressScanner` | `app._router.stack` |
| **Next.js** | `NextScanner` | 檔案系統 (`app/`, `pages/`) |
| **Nuxt** | `NuxtScanner` | 檔案系統 (`pages/`) |

### 搭配 Hono 使用

```typescript
import { Hono } from 'hono'
import { SitemapBuilder, HonoScanner } from '@gravito/luminosity'

const app = new Hono()
app.get('/hello', (c) => c.text('Hello'))
app.get('/blog/:slug', (c) => c.text('Blog'))

const builder = new SitemapBuilder({
  scanner: new HonoScanner(app),
  hostname: 'https://example.com',
  dynamicResolvers: [
    {
      pattern: '/blog/:slug',
      resolve: async () => {
        const posts = await getPosts()
        return posts.map(p => ({ slug: p.slug }))
      }
    }
  ]
})

const entries = await builder.build()
```

### 搭配 Next.js 使用

```typescript
// app/sitemap.ts
import { SitemapBuilder, NextScanner } from '@gravito/luminosity'

export default async function sitemap() {
  const builder = new SitemapBuilder({
    scanner: new NextScanner({ appDir: './app' }),
    hostname: 'https://example.com'
  })

  return builder.build()
}
```

### 建立自訂掃描器

您可以透過實作 `RouteScanner` 介面，為任何框架建立掃描器：

```typescript
import type { RouteScanner, ScannedRoute } from '@gravito/luminosity'

class MyFrameworkScanner implements RouteScanner {
  readonly framework = 'my-framework'

  async scan(): Promise<ScannedRoute[]> {
    // 您的路由發現邏輯
    return [
      { path: '/', method: 'GET', isDynamic: false },
      { path: '/blog/:slug', method: 'GET', isDynamic: true, params: ['slug'] }
    ]
  }
}
```
