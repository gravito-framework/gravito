# 插件市集標準 (GPS-001)

為了建立一個健康的生態系，Gravito 制定了 **Gravito Plugin Standard (GPS)**。本文件說明如何打包、命名與發布您的 Orbits 和 Satellites，以便讓 CLI 與未來的市集能夠發現它們。

## 1. 命名規範 (Naming Conventions)

為了確保在 npm 上容易被搜尋到，請遵循以下命名模式：

### Orbits (基礎設施模組)
*   格式: `gravito-orbit-<name>`
*   Scoped: `@<scope>/gravito-orbit-<name>`
*   範例: `gravito-orbit-redis`, `@my-org/gravito-orbit-payment`

### Satellites (應用功能插件)
*   格式: `gravito-plugin-<name>`
*   Scoped: `@<scope>/gravito-plugin-<name>`
*   範例: `gravito-plugin-blog`, `@my-org/gravito-plugin-seo`

## 2. Package.json 元數據

您的 `package.json` 是 Gravito 系統的清單 (Manifest)。

### 關鍵字 (Keywords)
您 **必須** 包含以下其中一個關鍵字：
*   `gravito-plugin` (用於 Satellites)
*   `gravito-orbit` (用於 Orbits)
*   `gravito-ecosystem` (通用)

這讓 CLI 能夠透過 `npm search keywords:gravito-plugin` 找到您的套件。

### `gravito` 物件
您 **建議** 在 `package.json` 中包含一個 `gravito` 屬性來定義整合細節。

```json
{
  "name": "gravito-plugin-blog",
  "version": "1.0.0",
  "keywords": ["gravito-plugin", "blog"],
  "peerDependencies": {
    "gravito-core": "^0.3.0"
  },
  "gravito": {
    "type": "satellite",
    "icon": "📝",
    "requires": ["db", "auth"],
    "configuration": {
      "BLOG_TITLE": {
        "type": "string",
        "default": "My Awesome Blog",
        "required": true
      }
    }
  }
}
```

*   **type**: `'satellite' | 'orbit'`
*   **requires**: 此插件依賴的 Orbit key 陣列 (例如 `['db', 'auth']`)。如果缺少這些依賴，CLI 會警告使用者。
*   **configuration**: 插件所需的环境变量或选项的 Schema。

## 3. 進入點標準 (Entry Point Standard)

您的主要進入點 (Main Entry Point) 必須 default export 一個符合 Gravito 簽名的函式。

```typescript
import { PlanetCore } from 'gravito-core';

export default function myPlugin(core: PlanetCore, options?: any) {
  // 實作內容
}
```

## 4. 發布

1.  確認您的套件是公開的 (Public)。
2.  執行 `npm publish`。
3.  一旦被 npm 索引，您的插件將自動出現在 Gravito 的搜尋結果中。
