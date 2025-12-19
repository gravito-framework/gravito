# 版本策略說明

## 📋 版本分類

### Beta 版本 (`1.0.0-beta.1`)

**官網實際使用的套件**，已經過實際驗證，可以發布為 beta 版本：

- `gravito-core` - 核心框架
- `@gravito/orbit-cache` - 快取模組
- `@gravito/orbit-inertia` - Inertia.js 整合
- `@gravito/orbit-view` - 視圖模組
- `@gravito/seo-adapter-hono` - SEO Hono 適配器
- `@gravito/seo-core` - SEO 核心模組

### Alpha 版本 (`1.0.0-alpha.1`)

**尚未在官網使用的套件**，仍在開發或測試階段：

- 所有其他 `@gravito/orbit-*` 套件
- 所有其他 `@gravito/seo-*` 套件
- `@gravito/validator`
- `@gravito/client`
- `@gravito/cli`

## 🔄 版本更新流程

### 1. 更新版本號

```bash
bun run version:update
```

這會根據套件是否在官網使用，自動設定正確的版本號。

### 2. 檢查版本

確認版本號是否正確：

```bash
# 檢查 beta 套件
grep -r '"version": "1.0.0-beta' packages/*/package.json

# 檢查 alpha 套件
grep -r '"version": "1.0.0-alpha' packages/*/package.json
```

### 3. 構建和發布

```bash
# 構建
bun run build

# 發布
bun run publish:all
```

## 📦 NPM 標籤

發布時會自動使用對應的 tag：

- **Beta 版本** → `npm publish --tag beta`
- **Alpha 版本** → `npm publish --tag alpha`
- **穩定版本** → `npm publish` (使用 `latest` tag)

## 🔄 版本升級路徑

### Alpha → Beta

當套件開始在官網使用時：

1. 將套件名稱加入 `scripts/update-package-versions.ts` 的 `OFFICIAL_SITE_PACKAGES` 陣列
2. 執行 `bun run version:update`
3. 重新發布

### Beta → Stable

當 beta 版本穩定後：

1. 修改 `scripts/update-package-versions.ts` 中的版本配置
2. 將 beta 套件版本改為 `1.0.0`
3. 執行 `bun run version:update`
4. 重新發布

## 📝 版本號格式

遵循 [Semantic Versioning](https://semver.org/)：

- **穩定版**: `1.0.0`
- **Beta**: `1.0.0-beta.1`, `1.0.0-beta.2`, ...
- **Alpha**: `1.0.0-alpha.1`, `1.0.0-alpha.2`, ...

## 🎯 安裝方式

### 安裝 Beta 版本

```bash
npm install gravito-core@beta
npm install @gravito/orbit-inertia@beta
```

### 安裝 Alpha 版本

```bash
npm install @gravito/orbit-auth@alpha
npm install @gravito/orbit-queue@alpha
```

### 安裝穩定版本

```bash
npm install gravito-core
# 或明確指定
npm install gravito-core@latest
```

## 🔍 檢查已發布的版本

```bash
# 查看所有版本
npm view gravito-core versions

# 查看特定 tag 的版本
npm view gravito-core dist-tags

# 查看 beta 版本
npm view gravito-core@beta version
```

