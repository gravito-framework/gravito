---
title: Relations
---

# Relations

> Atlas 提供了豐富的模型關聯支援，讓你能輕鬆定義與查詢資料表之間的關係。

## 定義關聯

在 Model 類別中定義關聯非常直觀：

```ts
import { Model } from '@gravito/atlas'

export class User extends Model {
  static table = 'users'

  // 一個使用者有多篇文章
  posts() {
    return this.hasMany(Post, 'userId')
  }
}

export class Post extends Model {
  static table = 'posts'

  // 一篇文章屬於一個使用者
  user() {
    return this.belongsTo(User, 'userId')
  }
}
```

## 支援的關聯類型

- `hasOne(RelatedModel, foreignKey?, localKey?)`
- `hasMany(RelatedModel, foreignKey?, localKey?)`
- `belongsTo(RelatedModel, foreignKey?, ownerKey?)`
- `belongsToMany(RelatedModel, pivotTable?, foreignPivotKey?, relatedPivotKey?)`
- `morphTo(name?, typeColumn?, idColumn?)`
- `morphOne(RelatedModel, name, typeColumn?, idColumn?)`
- `morphMany(RelatedModel, name, typeColumn?, idColumn?)`

## 預加載 (Eager Loading)

預加載可以幫助你解決 N+1 查詢問題。

### 使用 `with` 進行預加載

```ts
// 載入所有使用者及其文章
const users = await User.query().with('posts').get()

// 巢狀預加載 (使用者 -> 文章 -> 留言)
const users = await User.query().with('posts.comments').get()

// 多個預加載
const users = await User.query().with(['posts', 'profile']).get()
```

### 延遲預加載 (Lazy Eager Loading)

如果你已經有一個模型實例，可以使用 `load`：

```ts
const user = await User.find(1)
await user.load('posts')

// 現在可以存取關聯資料
const posts = user.posts // 返回 ModelCollection
```

## 關聯計數

如果你只需要知道關聯紀錄的數量，而不需要載入資料：

```ts
const users = await User.query().withCount('posts').get()

// 每個 user 會多出一個 posts_count 屬性
console.log(users[0].posts_count)
```

## 多態關聯

多態關聯允許一個模型屬於多個其他模型。詳情請參閱 [ORM 使用指南](../../guide/orm-usage.md#多態關聯polymorphic-relations)。

