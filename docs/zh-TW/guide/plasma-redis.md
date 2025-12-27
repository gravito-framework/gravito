---
title: Plasma Redis
description: Gravito 的 Redis 用戶端與 Orbit，提供 Laravel 風格 API 與多連線管理。
---

# Plasma Redis

Plasma（`@gravito/plasma`）是 Gravito 的 Redis 用戶端，提供簡潔的 Facade API 與多連線管理，也能以 Orbit 方式注入到應用中。

## 特色

- Laravel 風格的 `Redis` Facade
- 多連線管理與 `Redis.connection()`
- OrbitPlasma 可直接注入 `redis` 服務
- 支援 TLS、key prefix 與重試設定

## 安裝

```bash
bun add @gravito/plasma ioredis
```

## 基本設定（Facade）

```ts
import { Redis } from '@gravito/plasma'

Redis.configure({
  default: 'main',
  connections: {
    main: { host: '127.0.0.1', port: 6379 },
  },
})

await Redis.connect()

await Redis.set('user:1', JSON.stringify({ id: 1, name: 'Nova' }), { ex: 3600 })
const payload = await Redis.get('user:1')

await Redis.disconnect()
```

## 多連線

```ts
Redis.configure({
  default: 'cache',
  connections: {
    cache: { host: '127.0.0.1', port: 6379, db: 0 },
    analytics: { host: '127.0.0.1', port: 6380, db: 1 },
  },
})

const cache = Redis.connection('cache')
const analytics = Redis.connection('analytics')

await cache.set('cache:ping', 'ok')
await analytics.incr('metrics:pageviews')
```

## 以 Orbit 注入（應用內使用）

```ts
import { PlanetCore } from 'gravito-core'
import { OrbitPlasma } from '@gravito/plasma'

const core = await PlanetCore.boot({
  orbits: [
    new OrbitPlasma({
      autoConnect: true,
      exposeAs: 'redis',
      connections: {
        default: {
          host: '127.0.0.1',
          port: 6379,
          password: process.env.REDIS_PASSWORD,
          tls: true,
        },
      },
    }),
  ],
})
```

在路由中使用：

```ts
app.get('/health/redis', async (c) => {
  const redis = c.get('redis')
  const pong = await redis?.ping()
  return c.json({ status: pong })
})
```

## 連線參數

- `host` / `port`
- `password`
- `db`
- `connectTimeout` / `commandTimeout`
- `tls`
- `keyPrefix`
- `maxRetries` / `retryDelay`

## 與其他模組整合

- 快取系統：`@gravito/stasis` 可直接指定 `redis` store

## 注意事項

- Plasma 依賴 `ioredis`，請確認已安裝。
- 若需要 Redis Cluster / Sentinel 等進階架構，建議自行建立客製 Redis client 再對接你的 store 或應用層。
