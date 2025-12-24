# 資料庫與 ORM (Atlas)

Atlas 是 Gravito 原生的物件關聯對映系統 (ORM)，旨在為現代 TypeScript 應用提供優雅的 ActiveRecord 實作。它深受 Laravel Eloquent 的啟發，但完全針對 TypeScript 的靜態分析與 Bun 的高效能進行了重構。

::: info 🚧 **Alpha 狀態**
Atlas 目前處於 **Active Alpha** 階段。雖然核心功能（模型、關聯、查詢建構器）已經運作良好，但在 1.0 正式版發佈前，API 仍可能會有變動。目前的開發重心在於 MongoDB 的支援，Redis 與 SQL 驅動正在開發中。
:::

## 為什麼選擇 Atlas？

與資料庫的互動應該是直覺且富表現力的。Atlas 移除了繁瑣的手動查詢建構，讓您能使用清晰、物件導向的語法來操作資料。

```typescript
// 建立一個新用戶
const user = await User.create({
  name: 'Carl',
  email: 'carl@gravito.dev'
});

// 查找並更新
const post = await Post.where('slug', 'hello-world').first();
post.title = 'Hello Gravito';
await post.save();
```

## 核心功能

### 1. ActiveRecord 模式
每個資料表（或集合）都有一個對應的「模型 (Model)」負責與該表進行互動。您可以查詢表中的資料，也可以將新記錄寫入表中。

### 2. 多驅動支援
Atlas 設計為與底層資料庫無關。
- **MongoDB**: 提供一級支援，具備模擬 SQL 語法的流暢查詢建構器。
- **Redis**: 原生支援高效能鍵值存儲與快取。
- **SQL (Coming Soon)**: 計劃支援 PostgreSQL, MySQL 與 SQLite。

### 3. 豐富的關聯性
使用富表現力的方法定義模型間的關係：
- 一對一 (One to One)
- 一對多 (One to Many)
- 多對多 (Many to Many - 開發中)
- 多型關聯 (Polymorphic - 開發中)

### 4. 進階功能
- **觀察者 (Observers)**: 監聽模型生命週期事件 (creating, updated, deleted)。
- **作用域 (Scopes)**: 可重複使用的查詢約束。
- **型別轉換 (Casting)**: 自動轉換屬性格式 (例如 JSON, Date, Boolean)。

## 架構

Atlas 基於 `@gravito/atlas` 套件構建。它獨立於 HTTP 層之外，這意味著您可以在 CLI 指令、排程任務或獨立腳本中使用它。

```mermaid
graph TD
    A[應用程式代碼] --> B[Atlas Model]
    B --> C[查詢建構器]
    C --> D[驅動適配器 (Mongo/Redis/SQL)]
    D --> E[資料庫]
```

## 下一步

準備好開始了嗎？從設定您的資料庫連線開始。

- [快速上手](./quick-start)
- [查詢建構器](./query-builder)
- [遷移 (Migrations)](./migrations)
