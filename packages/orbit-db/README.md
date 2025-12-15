# @gravito/orbit-db

> The Standard Database Orbit for Galaxy Architecture.

Provides seamless integration with [Drizzle ORM](https://orm.drizzle.team/).

## 📦 Installation

```bash
bun add @gravito/orbit-db drizzle-orm
```

## 🚀 Usage

```typescript
import { PlanetCore } from 'gravito-core';
import orbitDB from '@gravito/orbit-db';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';

const core = new PlanetCore();
const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite);

// Register the orbit
orbitDB(core, {
  db,
  exposeAs: 'database' // Access via c.get('database')
});

core.mountOrbit('/api', app);
```

## 🪝 Hooks

- `db:connected` - Fired when the DB orbit initializes.
