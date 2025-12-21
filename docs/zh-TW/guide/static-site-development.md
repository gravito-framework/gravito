# 🌐 靜態網站開發指南

使用 Gravito + Inertia.js (React/Vue) 建構靜態網站的完整指南，適用於 GitHub Pages、Vercel、Netlify 等靜態託管平台。

## 📋 目錄

1. [概述](#概述)
2. [常見陷阱](#常見陷阱)
3. [標準開發流程](#標準開發流程)
4. [React 實作](#react-實作)
5. [Vue 實作](#vue-實作)
6. [建置與部署](#建置與部署)
7. [檢查清單](#檢查清單)

---

## 🎯 概述

使用 Inertia.js 建構靜態網站時，導航處理方式與動態應用程式不同：

- **動態應用**：Inertia 的 `Link` 組件使用 AJAX 請求從後端獲取頁面資料
- **靜態網站**：沒有後端伺服器，因此連結必須使用完整頁面導航

本指南確保您的靜態網站在所有託管平台上都能正常運作。

---

## ⚠️ 常見陷阱

### 1. **靜態環境中使用 Inertia Link**

**問題**：在靜態網站中使用 Inertia 的 `Link` 組件會導致導航失敗，因為沒有後端處理 AJAX 請求。

**症狀**：點擊連結時出現彈出效果或無法正常導航。

**解決方案**：使用 `StaticLink` 組件，自動檢測環境並使用適當的導航方法。

### 2. **缺少 GitHub Pages 的 404.html**

**問題**：GitHub Pages 預設不支援客戶端路由。

**解決方案**：在建置腳本中生成帶有 SPA 路由支援的 `404.html`。

### 3. **錯誤的基礎路徑配置**

**問題**：當網站部署到子目錄時，資源和路由無法正常工作。

**解決方案**：在 Vite 中配置基礎路徑，確保所有路徑都是相對路徑或使用環境變數。

---

## 🔄 標準開發流程

### 步驟 1：專案設定

```bash
# 建立新專案
bun create gravito-app my-static-site

# 安裝依賴
bun install
```

### 步驟 2：使用 StaticLink 組件

**在靜態網站中永遠不要直接使用 Inertia 的 `Link`。** 始終使用 `StaticLink`：

```tsx
// ❌ 錯誤
import { Link } from '@inertiajs/react'
<Link href="/about">關於</Link>

// ✅ 正確
import { StaticLink } from '@/components/StaticLink'
<StaticLink href="/about">關於</StaticLink>
```

### 步驟 3：建置腳本配置

確保您的 `build-static.ts` 包含：

1. ✅ 客戶端資源建置
2. ✅ 所有路由的靜態 HTML 生成
3. ✅ 帶有 SPA 支援的 404.html 生成
4. ✅ 靜態資源複製
5. ✅ GitHub Pages 的 CNAME/.nojekyll

### 步驟 4：部署前測試

部署前，在本地測試：

```bash
# 建置靜態網站
bun run build:static

# 本地服務（使用簡單的 HTTP 伺服器）
cd dist-static
python3 -m http.server 8000
# 或
npx serve dist-static

# 測試所有導航連結
# 驗證 404.html 對未知路由有效
```

---

## ⚛️ React 實作

### StaticLink 組件

建立 `src/client/components/StaticLink.tsx`：

```tsx
import { Link } from '@inertiajs/react'
import type { LinkProps } from '@inertiajs/react'
import type React from 'react'

/**
 * 檢測是否在靜態網站環境中
 */
function isStaticSite(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const hostname = window.location.hostname
  // 在此添加您的生產環境域名
  const staticDomains = [
    'gravito.dev',
    'yourdomain.com',
    // 如果需要，添加 GitHub Pages 模式
    // hostname.includes('github.io')
  ]

  return staticDomains.includes(hostname)
}

interface StaticLinkProps extends LinkProps {
  children: React.ReactNode
  className?: string
}

/**
 * 智能連結組件，在靜態網站中使用完整頁面導航
 * 在動態環境中使用 Inertia 導航
 */
export function StaticLink({ href, children, className, onClick, ...props }: StaticLinkProps) {
  const isStatic = isStaticSite()

  if (isStatic) {
    return (
      <a
        href={href as string}
        className={className}
        onClick={(e) => {
          if (onClick) onClick(e as any)
          // 在靜態模式下讓瀏覽器處理導航
        }}
        {...(props as Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'className' | 'onClick'>)}
      >
        {children}
      </a>
    )
  }

  return (
    <Link href={href} className={className} onClick={onClick} {...props}>
      {children}
    </Link>
  )
}
```

### 在組件中使用

```tsx
import { StaticLink } from '@/components/StaticLink'

export function Navigation() {
  return (
    <nav>
      <StaticLink href="/">首頁</StaticLink>
      <StaticLink href="/about">關於</StaticLink>
      <StaticLink href="/docs">文件</StaticLink>
    </nav>
  )
}
```

---

## 🟢 Vue 實作

### StaticLink 組件

建立 `src/client/components/StaticLink.vue`：

```vue
<template>
  <component :is="linkComponent" v-bind="linkProps">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { computed } from 'vue'

interface Props {
  href: string
  as?: string
  method?: string
  data?: Record<string, any>
  replace?: boolean
  preserveScroll?: boolean
  preserveState?: boolean
  only?: string[]
  except?: string[]
  headers?: Record<string, string>
  queryStringArrayFormat?: 'brackets' | 'indices'
  [key: string]: any
}

const props = defineProps<Props>()

/**
 * 檢測是否在靜態網站環境中
 */
function isStaticSite(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const hostname = window.location.hostname
  const staticDomains = [
    'gravito.dev',
    'yourdomain.com',
    // 添加您的生產環境域名
  ]

  return staticDomains.includes(hostname)
}

const isStatic = isStaticSite()

const linkComponent = computed(() => {
  return isStatic ? 'a' : Link
})

const linkProps = computed(() => {
  if (isStatic) {
    // 對於靜態網站，使用普通的 <a> 標籤
    const { href, ...rest } = props
    return {
      href,
      ...rest,
    }
  }

  // 對於動態網站，使用 Inertia Link
  return props
})
</script>
```

### 在組件中使用

```vue
<template>
  <nav>
    <StaticLink href="/">首頁</StaticLink>
    <StaticLink href="/about">關於</StaticLink>
    <StaticLink href="/docs">文件</StaticLink>
  </nav>
</template>

<script setup lang="ts">
import StaticLink from '@/components/StaticLink.vue'
</script>
```

---

## 🏗️ 建置與部署

### 建置腳本要求

您的 `build-static.ts` 必須包含：

```typescript
// 1. 建置客戶端資源
await execAsync('bun run build:client')

// 2. 初始化核心（不啟動伺服器）
const core = await bootstrap({ port: 3000 })

// 3. 為所有路由生成靜態 HTML
for (const route of routes) {
  const res = await core.app.request(route)
  const html = await res.text()
  await writeFile(join(outputDir, route, 'index.html'), html)
}

// 4. 生成帶有 SPA 路由支援的 404.html
const spaScript = `
<script>
  // GitHub Pages SPA 路由處理器
  (function() {
    const currentPath = window.location.pathname;
    // ... SPA 路由邏輯
  })();
</script>`
await writeFile(join(outputDir, '404.html'), htmlWithScript)

// 5. 複製靜態資源
await cp(staticDir, join(outputDir, 'static'), { recursive: true })

// 6. 建立 GitHub Pages 檔案
await writeFile(join(outputDir, 'CNAME'), 'yourdomain.com')
await writeFile(join(outputDir, '.nojekyll'), '')
```

### GitHub Pages 部署

1. 建置靜態網站：`bun run build:static`
2. 將 `dist-static/` 提交到 `gh-pages` 分支或透過 GitHub Actions 部署
3. 配置 GitHub Pages 從 `gh-pages` 分支或 `dist-static/` 資料夾提供服務

### Vercel/Netlify 部署

這些平台自動處理 SPA 路由，但仍使用 `StaticLink` 以保持一致性：

1. 建置：`bun run build:static`
2. 輸出目錄：`dist-static`
3. 透過 CLI 或 Git 整合部署

---

## ✅ 檢查清單

部署靜態網站前，請確認：

### 開發
- [ ] 所有導航連結使用 `StaticLink`（不是 Inertia 的 `Link`）
- [ ] `StaticLink` 組件正確檢測您的生產環境域名
- [ ] 所有路由都包含在建置腳本中
- [ ] 404.html 生成時包含 SPA 路由支援

### 建置
- [ ] 客戶端資源建置成功
- [ ] 所有路由生成有效的 HTML 檔案
- [ ] 靜態資源正確複製
- [ ] 404.html 存在並包含 SPA 腳本
- [ ] CNAME/.nojekyll 檔案存在（用於 GitHub Pages）

### 測試
- [ ] 在本地測試所有導航連結
- [ ] 測試未知路由的 404 頁面
- [ ] 驗證資源正確載入
- [ ] 部署後在生產環境域名上測試

### 文件
- [ ] 建置流程已記錄
- [ ] 部署步驟清晰
- [ ] 團隊成員知道使用 `StaticLink`

---

## 🔧 故障排除

### 連結無法導航

**檢查**：您是否使用 `StaticLink` 而不是 Inertia 的 `Link`？

**修復**：在導航組件中將所有 `Link` 導入替換為 `StaticLink`。

### 404 頁面無法運作

**檢查**：`404.html` 是否生成時包含 SPA 路由腳本？

**修復**：確保建置腳本在 404.html 中包含 SPA 路由處理器。

### 資源無法載入

**檢查**：資源路徑是否正確？基礎路徑是否配置？

**修復**：驗證 Vite `base` 配置，確保所有路徑都是相對路徑或使用環境變數。

---

## 📚 相關指南

- [部署指南](./deployment.md)
- [Inertia React 指南](./inertia-react.md)
- [SEO 引擎指南](./seo-engine.md)

---

> **記住**：在靜態網站中始終使用 `StaticLink` 進行導航。這確保您的網站在所有靜態託管平台上都能正常工作。

