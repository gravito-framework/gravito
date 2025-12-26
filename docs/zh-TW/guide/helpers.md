---
title: 輔助函式 (Helpers)
description: 了解 Gravito 提供的 Arr, Str 與資料路徑工具。
---

# 輔助函式 (Helpers)

> Gravito 提供一系列高效能的工具函式，協助您處理字串、陣列與物件路徑。

## 字串工具 (Str)

`Str` 提供了豐富的字串處理方法。

```typescript
import { Str } from 'gravito-core'

// 轉換為蛇形命名 (snake_case)
Str.snake('FooBar') // 'foo_bar'

// 轉換為串燒命名 (kebab-case)
Str.kebab('FooBar') // 'foo-bar'

// 轉換為大駝峰 (StudlyCase)
Str.studly('foo_bar') // 'FooBar'

// 轉換為小駝峰 (camelCase)
Str.camel('foo_bar') // 'fooBar'

// 限制長度
Str.limit('The quick brown fox', 10) // 'The quick...'

// 生成隨機字串
Str.random(16)

// 生成 UUID
Str.uuid()
```

## 陣列工具 (Arr)

`Arr` 提供了一套處理純陣列與物件陣列的方法。

```typescript
import { Arr } from 'gravito-core'

// 取得巢狀屬性
const user = { name: { first: 'Alice' } }
Arr.get(user, 'name.first') // 'Alice'

// 檢查路徑是否存在
Arr.has(user, 'name.last') // false

// 設定巢狀屬性
Arr.set(user, 'profile.age', 25)

// 提取特定欄位
const users = [{ id: 1, name: 'A' }, { id: 2, name: 'B' }]
Arr.pluck(users, 'name', 'id') // { '1': 'A', '2': 'B' }

// 排除屬性
Arr.except({ a: 1, b: 2, c: 3 }, ['a', 'c']) // { b: 2 }
```

## 資料路徑工具 (dataGet / dataSet)

底層的路徑解析工具，支援點記號 (`.`) 存取。

```typescript
import { dataGet, dataSet } from 'gravito-core'

const data = { posts: [{ title: 'Hello' }] }
const title = dataGet(data, 'posts.0.title') // 'Hello'
```

---

## 下一步
了解如何進行 [例外處理](./errors.md)。
