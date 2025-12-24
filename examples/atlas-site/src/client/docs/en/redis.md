# Warp Cache: Redis Accelerator Protocol

> **Status:** Sub-millisecond State Transmission Engaged.
> Redis isn't just a cache in Atlas—it's the nervous system of your high-concurrency applications.

## Accelerator Blueprint

Define your key-value clusters within the central Connection Nexus.

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

## Atomic Operations

Atlas provides a simplified, atomic interface for Redis operations, optimized for sub-millisecond response times.

```typescript
const cache = DB.connection('redis')

// High-speed key storage with TTL
await cache.setex('session:x102', 3600, { user: 'Carl' })

// Pipeline multiple commands for maximum throughput
await cache.pipeline()
  .set('metric:a', 1)
  .set('metric:b', 2)
  .incr('counter:total')
  .exec()
```

## The "Orbit Cache" Strategy

Combine Atlas SQL Models with Redis for ultimate performance.

1. **SQL as Truth:** Your PostgreSQL/SQLite handles relationship integrity.
2. **Redis as Speed:** Atlas provides built-in hooks to sync model changes into Redis instantly.

> "A well-governed system doesn't wait for the disk; it orbits the memory."
