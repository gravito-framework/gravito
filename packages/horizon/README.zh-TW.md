# @gravito/horizon

> Gravito 的分散式排程模組，支援任務排程與分散式鎖。

## 安裝

```bash
bun add @gravito/horizon
```

## 快速開始

```typescript
import { OrbitHorizon } from '@gravito/horizon'
import { OrbitCache } from '@gravito/stasis'

await PlanetCore.boot({
  config: {
    scheduler: {
      lock: { driver: 'cache' },
      nodeRole: 'worker'
    }
  },
  orbits: [
    OrbitCache,
    OrbitHorizon
  ]
})
```

```typescript
const scheduler = core.services.get('scheduler')

scheduler.task('daily-cleanup', async () => {
  await db.cleanup()
})
.daily()
.at('02:00')
.onOneServer()
```
