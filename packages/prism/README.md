# 🛰️ Orbit View

> Standard View Orbit for Gravito - Simple Template Engine with Image Optimization

**Orbit View** 提供簡單而強大的模板引擎，支援 HTML 模板渲染和標準化的圖片元件，符合 Core Web Vitals 標準。

## ✨ Features

- **簡單模板引擎** - 支援變數插值、條件判斷、迴圈和部分模板
- **標準化 Image 元件** - 零客戶端依賴、高效能圖片處理
- **Helper 函數系統** - 可擴展的 helper 函數註冊機制
- **Core Web Vitals 優化** - 自動優化圖片載入（LCP、CLS、FCP）
- **雙重使用方式** - 支援 HTML 模板和 React 組件
- **型別安全** - 完整的 TypeScript 支援

## 📦 Installation

```bash
bun add @gravito/prism
```

如果使用 React 組件（可選）：

```bash
bun add react react-dom
```

## 🚀 Quick Start

### 1. Register the Orbit

在 `bootstrap.ts` 中註冊：

```typescript
import { defineConfig } from 'gravito-core';
import { PlanetCore } from 'gravito-core';
import { OrbitPrism } from '@gravito/prism';

const config = defineConfig({
  config: {
    VIEW_DIR: 'src/views', // 可選，預設為 'src/views'
  },
  orbits: [OrbitPrism],
});

const core = await PlanetCore.boot(config);
```

### 2. 基本模板使用

在 Controller 中渲染視圖：

```typescript
import { Context } from 'hono';

export class HomeController {
  index = async (c: Context) => {
    const view = c.get('view');
    
    return c.html(
      view.render('home', {
        title: 'Welcome',
        visitors: 1000,
        version: '1.0.0'
      })
    );
  };
}
```

### 3. 模板語法

建立 `src/views/home.html`：

```html
<h1>{{title}}</h1>
<p>Visitors: {{visitors}}</p>
<p>Version: {{version}}</p>

{{#if visitors}}
  <p>We have visitors!</p>
{{else}}
  <p>No visitors yet.</p>
{{/if}}

{{#each items}}
  <div>{{this}}</div>
{{/each}}

{{include "partials/header"}}
```

## 🖼️ Image 元件使用

### HTML 模板中使用

在 HTML 模板中使用 `image` helper：

```html
<!-- 基本使用 -->
{{image src="/static/hero.jpg" alt="Hero image" width=1920 height=1080}}

<!-- 懶加載（預設） -->
{{image src="/static/thumbnail.jpg" alt="Thumbnail" width=400 height=300}}

<!-- 首屏圖片（立即載入） -->
{{image src="/static/hero.jpg" alt="Hero" width=1920 height=1080 loading="eager" fetchpriority="high"}}

<!-- 自訂樣式 -->
{{image src="/static/logo.png" alt="Logo" width=200 height=200 class="logo" style="max-width: 100%;"}}

<!-- 響應式圖片（自動生成 srcset） -->
{{image src="/static/banner.jpg" alt="Banner" width=1920 height=600 sizes="(max-width: 768px) 100vw, 50vw"}}
```

### React 組件中使用

在 React 組件中使用 `Image` 組件：

```tsx
import { Image } from '@gravito/prism';

export default function Home() {
  return (
    <div>
      {/* 基本使用 */}
      <Image 
        src="/static/hero.jpg" 
        alt="Hero image"
        width={1920} 
        height={1080} 
      />

      {/* 首屏圖片 */}
      <Image 
        src="/static/hero.jpg" 
        alt="Hero"
        width={1920} 
        height={1080}
        loading="eager"
        fetchpriority="high"
      />

      {/* 響應式圖片 */}
      <Image 
        src="/static/banner.jpg" 
        alt="Banner"
        width={1920} 
        height={600}
        sizes="(max-width: 768px) 100vw, 50vw"
        srcset={[400, 800, 1200, 1920]}
      />

      {/* 自訂樣式 */}
      <Image 
        src="/static/logo.png" 
        alt="Logo"
        width={200} 
        height={200}
        className="logo"
        style={{ maxWidth: '100%' }}
      />
    </div>
  );
}
```

## 📖 API Reference

### Image Helper (HTML 模板)

語法：`{{image src="..." alt="..." [options]}}`

#### 必要參數

- `src` (string) - 圖片路徑
- `alt` (string) - 圖片替代文字（無障礙性要求）

#### 可選參數

- `width` (number) - 圖片寬度（像素）
- `height` (number) - 圖片高度（像素）
- `loading` ('lazy' | 'eager') - 載入方式，預設為 'lazy'
- `sizes` (string) - 響應式圖片 sizes 屬性
- `srcset` (boolean | string) - 是否啟用 srcset，或指定寬度列表（例如 "400,800,1200"）
- `class` (string) - CSS 類別名稱
- `style` (string) - 內聯樣式
- `decoding` ('async' | 'auto' | 'sync') - 解碼方式，預設為 'async'
- `fetchpriority` ('high' | 'low' | 'auto') - 載入優先級

#### 範例

```html
{{image src="/static/hero.jpg" alt="Hero" width=1920 height=1080 loading="eager" fetchpriority="high"}}
```

### Image Component (React)

```tsx
import { Image, ImageProps } from '@gravito/prism';
```

#### Props

```typescript
interface ImageProps {
  src: string;                    // 必要：圖片路徑
  alt: string;                    // 必要：替代文字
  width?: number;                 // 可選：寬度
  height?: number;                // 可選：高度
  loading?: 'lazy' | 'eager';     // 可選：載入方式
  sizes?: string;                // 可選：響應式 sizes
  srcset?: boolean | number[];   // 可選：srcset 設定
  className?: string;            // 可選：CSS 類別
  style?: string;                // 可選：內聯樣式
  decoding?: 'async' | 'auto' | 'sync';  // 可選：解碼方式
  fetchpriority?: 'high' | 'low' | 'auto'; // 可選：優先級
}
```

### TemplateEngine API

```typescript
// 渲染視圖
view.render(viewName: string, data?: Record<string, unknown>, options?: RenderOptions): string

// 註冊 helper 函數
view.registerHelper(name: string, fn: HelperFunction): void

// 移除 helper 函數
view.unregisterHelper(name: string): void
```

## 🎯 Core Web Vitals 優化

Image 元件自動優化以下指標：

### LCP (Largest Contentful Paint)

- 使用 `loading="eager"` 和 `fetchpriority="high"` 於首屏圖片
- 優化圖片路徑，確保快速載入

### CLS (Cumulative Layout Shift)

- **強制要求** `width` 和 `height` 屬性
- 自動添加這些屬性到生成的 `<img>` 標籤

### FCP (First Contentful Paint)

- 預設使用 `decoding="async"` 進行非阻塞解碼
- 支援 `fetchpriority` 屬性以優先載入關鍵圖片

## 🔧 進階使用

### 自訂 Helper 函數

```typescript
import { TemplateEngine } from '@gravito/prism';
import type { HelperFunction } from '@gravito/prism';

const engine = new TemplateEngine('./views');

// 註冊自訂 helper
const myHelper: HelperFunction = (args, data) => {
  return `<div class="custom">${args.content}</div>`;
};

engine.registerHelper('custom', myHelper);
```

在模板中使用：

```html
{{custom content="Hello World"}}
```

### 透過 Hook 註冊 Helper

OrbitPrism 會觸發 `view:helpers:register` hook，允許其他模組註冊 helper：

```typescript
core.hooks.addAction('view:helpers:register', (engine: TemplateEngine) => {
  engine.registerHelper('myHelper', (args, data) => {
    return 'Custom output';
  });
});
```

### 響應式圖片最佳實踐

```html
<!-- 自動生成 srcset（基於 width） -->
{{image src="/static/hero.jpg" alt="Hero" width=1920 height=1080}}

<!-- 自訂 srcset 寬度 -->
{{image src="/static/banner.jpg" alt="Banner" width=1920 height=600 srcset="400,800,1200,1920" sizes="(max-width: 768px) 100vw, 50vw"}}
```

## 📝 範例專案

查看完整範例：

- [Basic Template](../../templates/basic) - 純 HTML 模板範例
- [Inertia React](../../templates/inertia-react) - React + Inertia 範例

## 🔍 技術細節

### 零客戶端依賴

- 所有邏輯在服務端執行
- React 組件僅用於服務端渲染（SSR）
- 不包含任何客戶端 JavaScript bundle

### 圖片路徑處理

- 自動正規化相對路徑（確保以 `/` 開頭）
- 保留完整 URL（`http://`, `https://`, `//`）
- 與 Hono 的 `serveStatic` 中間件完美整合

### 安全性

- 自動轉義 HTML 特殊字元
- 強制要求 `alt` 屬性（無障礙性）
- 所有內容由 ImageService 控制，避免 XSS

## 📚 相關文檔

- [Gravito Core 文檔](../../docs/zh-TW/guide/core-concepts.md)
- [Plugin 開發指南](../../docs/zh-TW/guide/plugin-development.md)

## 📝 License

MIT
