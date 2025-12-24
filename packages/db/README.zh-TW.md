# @gravito/db

> Gravito 的標準資料庫 Orbit，整合 Drizzle ORM 並最佳化 PostgreSQL。

## 安裝

```bash
bun add @gravito/db drizzle-orm
```

## 快速開始

```typescript
import { PlanetCore } from 'gravito-core'
import orbitDB from '@gravito/db'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const core = new PlanetCore()
const client = postgres(process.env.DATABASE_URL)
const db = drizzle(client)

orbitDB(core, {
  db,
  databaseType: 'postgresql',
  exposeAs: 'db'
})

core.app.get('/users', async (c) => {
  const db = c.get('db')
  const users = await db.raw.select().from(users)
  return c.json({ users })
})
```
