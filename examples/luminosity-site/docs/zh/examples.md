---
title: 使用範例
order: 3
---

# 使用範例

探索將 Luminosity 整合至您應用程式中的常見模式與最佳實踐。

## 1. 基礎靜態 Sitemap

對於小型網站或靜態內容，您可以直接提供一個 URL 陣列。

```typescript
import { Luminosity } from '@gravito/luminosity'

const engine = new Luminosity({
  path: './public',
  hostname: 'https://mysite.com'
})

// 定義靜態條目
const entries = [
  { url: '/', changefreq: 'daily', priority: 1.0 },
  { url: '/about', changefreq: 'monthly', priority: 0.8 },
  { url: '/contact', changefreq: 'yearly', priority: 0.5 }
]

// 生成 sitemap.xml
await engine.generate(entries)
```

## 2. 資料庫串流 (極致效能)

對於大型資料集（例如電商產品、使用者檔案），請使用 **Async Iterators (非同步迭代器)**。這允許 Luminosity 以恆定的記憶體用量處理數百萬筆記錄。

```typescript
import { Luminosity } from '@gravito/luminosity'
import { db } from './my-database' // 您的資料庫客戶端

const engine = new Luminosity({
  path: './public',
  hostname: 'https://shop.com'
})

// Generator 函數逐一產出記錄
async function* getProductEntries() {
  const stream = db.select('slug', 'updated_at').from('products').stream()
  
  for await (const product of stream) {
    yield {
      url: `/product/${product.slug}`,
      lastmod: product.updated_at, // ISO 8601 字串或 Date 物件
      changefreq: 'weekly'
    }
  }
}

// Luminosity 直接消耗串流，無需載入所有資料至記憶體
await engine.generate(getProductEntries())
```

## 3. 整合 Hono 框架

Luminosity 與 Hono 等現代邊緣框架完美相容。

```typescript
import { Hono } from 'hono'
import { Luminosity } from '@gravito/luminosity'
import { serveStatic } from 'hono/bun'

const app = new Hono()
const lux = new Luminosity({ path: './dist' })

// 1. 啟動時生成 (或透過 cron job)
await lux.generate(myEntries)

// 2. 提供生成的文件
app.use('/sitemap*.xml', serveStatic({ root: './dist' }))
app.use('/robots.txt', serveStatic({ root: './dist' }))

// 3. (可選) 動態 Robots.txt 控制
app.get('/robots.txt', (c) => {
  return c.text(lux.robots().allow('*').build())
})

export default app
```

## 4. 多語言支援 (i18n)

使用 `links` 屬性來處理頁面的在地化版本 (alternate links)。

```typescript
const entries = [
  { 
    url: '/en/home', 
    links: [
      { lang: 'en', url: 'https://site.com/en/home' },
      { lang: 'fr', url: 'https://site.com/fr/home' },
      { lang: 'zh', url: 'https://site.com/zh/home' }
    ]
  }
]

await engine.generate(entries)
```
