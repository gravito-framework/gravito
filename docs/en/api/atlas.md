---
title: Atlas
---

# Atlas

> Database integration as a Gravito Orbit with **full PostgreSQL support and performance optimizations**.

Package: `@gravito/atlas`

This Orbit integrates **Drizzle ORM**, providing standardized database connection, request-context injection, transactions, query helpers, health checks, migrations/seeding, and hooks.

## Reading Guide

This page is an overview. Detailed docs are grouped by topic:

| Topic | Page |
|------|------|
| Getting started | [Getting Started](./atlas/getting-started.md) |
| DBService (query helpers) | [DBService](./atlas/dbservice.md) |
| Models (Eloquent-like API) | [Models](./atlas/models.md) |
| Relations | [Relations](./atlas/relations.md) |
| Migrations & seeding | [Migrations & Seeding](./atlas/migrations-seeding.md) |

## What You Get

- A `DBService` injected into the Gravito `Context`
- `db.raw` access to the underlying Drizzle instance
- Transactions, CRUD helpers, pagination, bulk operations, aggregates
- Relation queries backed by Drizzle `db.raw.query.*`
- Optional query logging + hooks (`db:query`, `db:transaction:*`, `db:migrate:*`, etc.)

## Installation

```bash
bun add @gravito/atlas drizzle-orm
```

## Quick Start

See [Getting Started](./atlas/getting-started.md) for full examples (PostgreSQL/SQLite, injection, config).

```ts
import { PlanetCore } from 'gravito-core'
import { OrbitAtlas } from '@gravito/atlas'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

const core = new PlanetCore()
const client = postgres(process.env.DATABASE_URL!)
const db = drizzle(client)

core.orbit(OrbitAtlas, { db, databaseType: 'postgresql', exposeAs: 'db' })

core.app.get('/users/:id', async (c) => {
  const db = c.get('db')
  const user = await db.findById({ _: { name: 'users' } }, c.req.param('id'))
  return c.json({ user })
})
```

## ORM Guide

- [ORM Usage Guide (English)](../guide/orm-usage.md)
- [ORM Usage Guide (zh-TW)](../../zh-TW/guide/orm-usage.md)
