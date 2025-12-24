# Atlas 快速上手

本指南將帶您完成資料庫連線設定、定義模型以及執行基本 CRUD 操作的流程。

## 1. 安裝

Atlas 運行於 `@gravito/atlas` 套件之上。如果您使用 `create-gravito-app` 建立專案，通常已經內建安裝。

```bash
bun add @gravito/atlas typescript
```

根據您選擇的資料庫，您還需要安裝對應的驅動程式：

```bash
# For MongoDB
bun add mongodb

# For Redis
bun add ioredis
```

## 2. 設定

在 `src/config/database.ts` 中設定您的資料庫連線。Atlas 支援多重連線設定。

```typescript
import { Env } from '@gravito/core';

export default {
  default: Env.get('DB_CONNECTION', 'mongodb'),

  connections: {
    mongodb: {
      driver: 'mongodb',
      url: Env.get('DB_URI', 'mongodb://localhost:27017/gravito'),
      database: Env.get('DB_DATABASE', 'gravito'),
    },
    
    redis: {
      driver: 'redis',
      host: Env.get('REDIS_HOST', '127.0.0.1'),
      port: Env.get('REDIS_PORT', 6379),
    }
  }
}
```

## 3. 定義模型 (Model)

模型通常位於 `src/models` 目錄。一個模型需繼承 `Model` 類別並定義其結構。

```typescript
import { Model } from '@gravito/atlas';

export interface UserAttributes {
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Model<UserAttributes> {
  // 集合名稱（可選，預設依類別名稱推斷）
  static collection = 'users';

  // 預設屬性值
  protected attributes: Partial<UserAttributes> = {
    role: 'user'
  };

  // 在 JSON 輸出時隱藏的欄位
  protected hidden = ['password'];

  // 型別轉換設定
  protected casts = {
    email: 'string',
    role: 'string',
    createdAt: 'date'
  };
}
```

## 4. 基本用法

一旦與定義好模型，您就可以開始與資料庫互動。

### 建立記錄 (Create)

```typescript
const user = await User.create({
  name: 'Alice',
  email: 'alice@example.com'
});

console.log(user._id); // 自動生成的 ID
```

### 讀取記錄 (Retrieve)

```typescript
// 透過 ID 查找
const user = await User.find('65a...');

// 透過條件查找
const admin = await User.where('role', 'admin').first();

// 獲取所有記錄
const allUsers = await User.all();
```

### 更新記錄 (Update)

```typescript
const user = await User.find('...');
user.name = 'Alice Wonderland';
await user.save();

// 或者批次更新
await User.where('role', 'user').update({ active: true });
```

### 刪除記錄 (Delete)

```typescript
const user = await User.find('...');
await user.delete();

// 或者批次刪除
await User.destroy('...'); // 透過 ID
```

## 下一步

- 探索 [查詢建構器](./query-builder) 學習複雜查詢。
- 學習 [關聯 (Relationships)](./relationships) 來連結多個模型。
