---
title: Plasma Redis
description: Gravito's Redis client and Orbit with a Laravel-style API and multi-connection support.
---

# Plasma Redis

Plasma (`@gravito/plasma`) is Gravito's Redis client. It provides a simple Facade API, multi-connection management, and an Orbit integration for `PlanetCore`.

## Features

- Laravel-style `Redis` Facade
- Multi-connection management via `Redis.connection()`
- OrbitPlasma injects a `redis` service
- TLS, key prefix, and retry options

## Install

```bash
bun add @gravito/plasma ioredis
```

## Basic Setup (Facade)

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

## Multiple Connections

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

## Orbit Integration

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

Use in a route:

```ts
app.get('/health/redis', async (c) => {
  const redis = c.get('redis')
  const pong = await redis?.ping()
  return c.json({ status: pong })
})
```

## Connection Options

- `host` / `port`
- `password`
- `db`
- `connectTimeout` / `commandTimeout`
- `tls`
- `keyPrefix`
- `maxRetries` / `retryDelay`

## Integrations

- Cache layer: `@gravito/stasis` can use a `redis` store

## Notes

- Plasma depends on `ioredis`; make sure it is installed.
- For Redis Cluster / Sentinel, create your own client and integrate at the store or app layer.
