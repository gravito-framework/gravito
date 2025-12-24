# @gravito/dark-matter

> Gravito 的 MongoDB 用戶端，Bun 原生、Laravel 風格 API。

## 安裝

```bash
bun add @gravito/dark-matter mongodb
```

## 快速開始

```typescript
import { Mongo } from '@gravito/dark-matter'

Mongo.configure({
  default: 'main',
  connections: {
    main: { uri: 'mongodb://localhost:27017', database: 'myapp' }
  }
})

await Mongo.connect()

const users = await Mongo.collection('users')
  .where('status', 'active')
  .orderBy('createdAt', 'desc')
  .limit(10)
  .get()

await Mongo.disconnect()
```
