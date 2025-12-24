# 查詢建構器 (Query Builder)

Atlas 提供了一套流暢的查詢建構器，讓您無需撰寫原生 SQL 或 Mongo 查詢物件，即可構建複雜的資料庫查詢。它跨驅動程式提供了統一的開發介面。

## 基礎 Where 子句

### `where`

最基本的查詢是 `where`。它接收欄位名稱、運算符（可選）以及數值。

```typescript
// 隱含 '=' 運算符
const users = await User.where('role', 'admin').get();

// 顯式指定運算符
const activeUsers = await User.where('logins', '>=', 5).get();

// 巢狀鍵值（視驅動程式支援而定）
const users = await User.where('meta.is_subscribed', true).get();
```

### `orWhere`

要加入 `OR` 條件，請使用 `orWhere`。

```typescript
// role = 'admin' OR role = 'moderator'
const staff = await User.where('role', 'admin')
                        .orWhere('role', 'moderator')
                        .get();
```

### `whereIn` / `whereNotIn`

檢查欄位值是否包含在指定的陣列中。

```typescript
const users = await User.whereIn('id', [1, 2, 3]).get();
```

## 排序與分頁

### `orderBy`

根據指定欄位排序結果。第二個參數控制方向（`asc` 或 `desc`）。

```typescript
const newestUsers = await User.orderBy('createdAt', 'desc').get();
```

### `skip` 與 `take` (Offset / Limit)

```typescript
// 取得 10 位用戶，跳過前 5 位
const users = await User.skip(5).take(10).get();
```

## 取得結果

### `get()`

執行查詢並回傳模型實例的陣列。

```typescript
const users = await User.where('active', true).get();
```

### `first()`

執行查詢並回傳第一個匹配的模型實例，若無結果則回傳 `null`。

```typescript
const user = await User.where('email', 'foo@bar.com').first();
```

### `count()`

回傳符合查詢條件的記錄數量（整數）。

```typescript
const count = await User.where('active', true).count();
```

### `exists()`

若有任何記錄符合查詢條件，回傳 `true`。

```typescript
if (await User.where('email', email).exists()) {
    // ...
}
```

## 進階子句

### `whereNull` / `whereNotNull`

```typescript
const incomplete = await Task.whereNull('completedAt').get();
```

## 原生查詢

如果您需要繞過建構器，通常可以存取底層的驅動程式實例，但請注意這會破壞驅動程式的無關性（Driver Agnosticism）。

```typescript
// 針對 MongoDB 驅動的特定用法
await User.collection.aggregate([...]); 
```
