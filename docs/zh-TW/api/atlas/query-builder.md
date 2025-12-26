---
title: 查詢構造器 (Query Builder)
---

# 查詢構造器 (Query Builder)

> Atlas 的查詢構造器提供了一個流暢、易於使用的介面來構建和執行資料庫查詢。

## 基本用法

透過 `DB.table()` 開始一個對特定資料表的查詢。

```ts
import { DB } from '@gravito/atlas'

const users = await DB.table('users').get()
```

## 選擇 (Select)

```ts
// 指定欄位
const users = await DB.table('users').select('id', 'name', 'email').get()

// 唯一查詢
const distinctRoles = await DB.table('users').distinct().select('role').get()

// 原始 SQL 選擇
const users = await DB.table('users')
  .selectRaw('COUNT(*) as count, status')
  .groupBy('status')
  .get()
```

## Where 子句

### 基本 Where

```ts
// 基本比較
const user = await DB.table('users').where('id', 1).first()

// 指定運算子
const items = await DB.table('products').where('price', '>', 100).get()

// 多個條件 (AND)
const items = await DB.table('users')
  .where('active', true)
  .where('role', 'admin')
  .get()

// OR Where
const items = await DB.table('users')
  .where('id', 1)
  .orWhere('email', 'admin@example.com')
  .get()
```

### 進階 Where (Advanced Queries)

#### Where In / Between / Null

```ts
// Where In
const roles = await DB.table('users').whereIn('id', [1, 2, 3]).get()

// Where Between
const users = await DB.table('users').whereBetween('votes', [1, 100]).get()

// Where Null / Not Null
const users = await DB.table('users').whereNull('updated_at').get()
```

#### JSON 查詢

Atlas 支援對 JSON 欄位進行深入查詢（目前支援 PostgreSQL, MySQL, SQLite）。

```ts
// 檢查 JSON 路徑的值
const users = await DB.table('users')
  .whereJson('settings->theme', 'dark')
  .get()

// 檢查 JSON 是否包含特定物件/值
const users = await DB.table('users')
  .whereJsonContains('options', { beta: true })
  .get()
```

#### 嵌套條件

```ts
const users = await DB.table('users')
  .where('email', 'like', '%@example.com')
  .where((query) => {
    query.where('votes', '>', 100).orWhere('title', 'Admin')
  })
  .get()
```

## 連結 (Joins)

```ts
const users = await DB.table('users')
  .join('profiles', 'users.id', '=', 'profiles.user_id')
  .select('users.*', 'profiles.avatar')
  .get()

// Left Join
const posts = await DB.table('posts')
  .leftJoin('comments', 'posts.id', '=', 'comments.post_id')
  .get()
```

## 排序、分組、限制

```ts
// 排序
const users = await DB.table('users').orderBy('name', 'desc').get()
const latest = await DB.table('users').latest().get()

// 分組與 Having
const stats = await DB.table('orders')
  .groupBy('status')
  .having('count', '>', 5)
  .selectRaw('status, COUNT(*) as count')
  .get()

// 限制與偏移
const users = await DB.table('users').skip(10).take(5).get()
```

## 聚合 (Aggregates)

```ts
const count = await DB.table('users').count()
const maxPrice = await DB.table('products').max('price')
const average = await DB.table('users').avg('age')
const sum = await DB.table('orders').sum('total')
```

## 分頁

Atlas 提供內建的分頁支援。詳細說明請參閱 [分頁](./pagination.md)。

```ts
const results = await DB.table('users').paginate(15, 1)
```
