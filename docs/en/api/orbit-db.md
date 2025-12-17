---
title: Orbit DB
---

# Orbit DB

> Database integration as a Gravito Orbit.

Package: `@gravito/orbit-db`

Provides seamless integration with [Drizzle ORM](https://orm.drizzle.team/).

## Installation

```bash
bun add @gravito/orbit-db drizzle-orm
```

## Usage

```typescript
import { PlanetCore } from 'gravito-core';
import orbitDB from '@gravito/orbit-db';
import { Hono } from 'hono';
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

const api = new Hono();

api.get('/health', (c) => c.text('ok'));

core.mountOrbit('/api', api);
```

## Hooks

- `db:connected` - Fired when the DB orbit initializes.
