# Gravito 星系架構 (Galaxy Architecture)

Gravito 是一個基於 TypeScript 的微核心框架，旨在構建可擴展、模組化的後端系統。
它採用獨特的 **星系架構 (Galaxy Architecture)** —— 靈感來自天體力學，用於管理生命週期、擴充模組 (Orbits) 和輕量級插件 (Satellites)。

## 🌟 核心特色

- **微核心 (PlanetCore)**: 極輕量、高效能的核心 (基於 [Hono](https://hono.dev))，僅負責生命週期和 Hook 系統。
- **軌道 (Orbits)**: 功能豐富的擴充模組 (如資料庫、驗證、儲存)，完全解耦地圍繞核心運行。
- **衛星 (Satellites)**: 輕量級的業務邏輯插件，可掛載於核心或軌道之上。
- **高效能**: 針對 Bun 執行環境優化，提供極快的啟動速度與請求處理能力。
- **開發體驗**: 強烈關注 TypeScript 支援、智能預設值與標準化。

## 🚀 快速開始

### 安裝

```bash
bun add gravito-core
```

### 基本用法

```typescript
import { PlanetCore } from 'gravito-core';

const core = new PlanetCore();

// 加入一個簡單的 Hook
core.hooks.addAction('app:ready', () => {
  console.log('我們升空了！ 🚀');
});

// 啟動伺服器
core.liftoff();
```

## 📚 文件資源

詳細文件請見 [docs](./docs) 目錄。

- [核心概念與用法](./docs/zh-TW/guide/core-concepts.md)
- [插件開發指南](./docs/zh-TW/guide/plugin-development.md)
- [English Documentation](./README.md)

## 📦 生態系 (Orbits)

| 套件 | 描述 | 狀態 |
|str|str|str|
|---|---|---|
| `gravito-core` | 微核心框架。 | ✅ Stable (Alpha) |
| `@gravito/orbit-db` | 標準資料庫軌道 (Drizzle)。 | ✅ Alpha |
| `@gravito/orbit-auth` | 標準身份驗證軌道 (JWT)。 | ✅ Alpha |
| `@gravito/orbit-storage` | 標準儲存軌道 (Local/S3)。 | ✅ Alpha |
| `@gravito/orbit-cache` | 標準快取軌道 (Memory/Redis)。 | ✅ Alpha |

## 🤝 貢獻

歡迎貢獻！請先閱讀 [CONTRIBUTING.md](./CONTRIBUTING.md)。

## 📄 授權

MIT © Carl Lee
