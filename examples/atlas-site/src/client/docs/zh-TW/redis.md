# 曲速快取：Redis 加速協定 (Redis Accelerator)

> **當前狀態：** 亞毫秒級狀態傳輸已啟動。
> 在 Atlas 中，Redis 不僅僅是一個快取——它是您高流量應用程式的神經系統。

## 加速器藍圖 (Accelerator Blueprint)

在中央連線樞紐 (Connection Nexus) 中定義您的鍵值 (Key-Value) 叢集。

```typescript
// atlas.config.ts
export default defineConfig({
  connections: {
    redis: {
      driver: 'redis',
      host: '127.0.0.1',
      port: 6379,
      password: process.env.REDIS_PASSWORD
    }
  }
})
```

## 原子化操作 (Atomic Operations)

Atlas 為 Redis 操作提供了一個簡化且具備原子性的介面，專為亞毫秒級響應時間而優化。

```typescript
const cache = DB.connection('redis')

// 帶有 TTL 的高速鍵值儲存
await cache.setex('session:x102', 3600, { user: 'Carl' })

// 使用管道 (Pipeline) 處理多個指令以換取最大吞吐量
await cache.pipeline()
  .set('metric:a', 1)
  .set('metric:b', 2)
  .incr('counter:total')
  .exec()
```

## 「軌道快取」策略 (The Orbit Cache Strategy)

將 Atlas SQL 模型與 Redis 結合，實現極致效能。

1. **SQL 為真理：** 您的 PostgreSQL/SQLite 處理關聯完整性。
2. **Redis 為速度：** Atlas 提供內建掛鉤 (Hooks)，能將模型變更即時同步至 Redis。

> 「一個治理良好的系統不會等待磁碟；它應當繞著記憶體運行。」
