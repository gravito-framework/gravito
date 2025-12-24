# @gravito/plasma

> Gravito 的 Redis 用戶端，Bun 原生、Laravel 風格 API。

## 安裝

```bash
bun add @gravito/plasma ioredis
```

## 快速開始

```typescript
import { Redis } from '@gravito/plasma'

Redis.configure({
  default: 'main',
  connections: {
    main: { host: 'localhost', port: 6379 }
  }
})

await Redis.connect()

await Redis.set('user:123', JSON.stringify({ name: 'John' }), { ex: 3600 })
const user = await Redis.get('user:123')

await Redis.disconnect()
```
