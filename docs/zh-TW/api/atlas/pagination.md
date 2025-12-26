---
title: 分頁 (Pagination)
---

# 分頁 (Pagination)

> Atlas 提供了簡單且功能強大的分頁機制，可以輕鬆處理大量資料。

## 基本分頁

您可以使用 `paginate` 方法來對查詢結果進行分頁。該方法會自動處理 `LIMIT` 和 `OFFSET`，並執行額外的 `COUNT` 查詢以獲取總數。

```ts
import { DB } from '@gravito/atlas'

// 每頁 15 筆，顯示第 1 頁
const results = await DB.table('users').where('active', true).paginate(15, 1)
```

### 回傳結構 (`PaginateResult`)

`paginate` 方法回傳一個包含 `data` 和 `pagination` 的物件：

```ts
{
  "data": [...], // 當前頁面的資料
  "pagination": {
    "page": 1,        // 當前頁碼
    "perPage": 15,    // 每頁筆數
    "total": 100,     // 總資料筆數
    "totalPages": 7,  // 總頁數
    "hasNext": true,  // 是否有下一頁
    "hasPrev": false  // 是否有上一頁
  }
}
```

## 簡單分頁 (Simple Pagination)

如果您只需要「上一頁」和「下一頁」連結，而不需要知道精確的總筆收，可以使用 `simplePaginate`。

```ts
const results = await DB.table('users').simplePaginate(15, 1)
```

## 分塊處理 (Chunking)

如果您需要處理數千條資料但不希望一次載入所有資料到記憶體，可以使用 `chunk` 方法：

```ts
await DB.table('users').chunk(100, async (users) => {
  for (const user of users) {
    // 處理每個 chunk 的資料
    console.log(user.name)
  }
  
  // 若要停止處理，回傳 false
  // return false;
})
```

## 穩定分頁 (Deterministic Ordering)

Atlas 的分頁會自動在排序列後方追加主鍵（Primary Key）作為「tie-breaker」，以確保在多列具有相同值時（例如 `status`），分頁結果保持穩定且不會出現重複或遺漏。

如果您使用非預設的主鍵名稱，可以將其傳遞給 `paginate`：

```ts
await DB.table('users').paginate(15, 1, 'user_uuid')
```
