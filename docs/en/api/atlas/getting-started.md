---
title: Getting Started
---

# Getting Started

> Atlas is a database toolkit for Gravito that provides a Laravel-style Query Builder and ORM.

## Installation

```bash
bun add @gravito/atlas
```

## Basic Configuration

You should configure Atlas during your application's bootstrap phase (e.g., `bootstrap.ts`). Use `DB.configure` to set up your database connections.

```ts
import { DB } from '@gravito/atlas'

DB.configure({
  default: 'postgres',
  connections: {
    postgres: {
      driver: 'postgres',
      host: 'localhost',
      database: 'gravito',
      username: 'user',
      password: 'password'
    },
    sqlite: {
      driver: 'sqlite',
      database: 'database.sqlite'
    }
  }
})
```

## Basic Usage

You can use the `DB` facade to start building queries from any table.

```ts
// Fetching all records
const users = await DB.table('users').get()

// Fetching a single record
const user = await DB.table('users').where('id', 1).first()

// Advanced query
const activeAdmins = await DB.table('users')
  .where('active', true)
  .where('role', 'admin')
  .orderBy('created_at', 'desc')
  .get()
```

## Multi-Database Support

If you have configured multiple connections, you can switch between them using `DB.connection()`.

```ts
// Use the 'sqlite' connection
const logs = await DB.connection('sqlite').table('logs').get()
```

## Using in Routes

Since `DB` is a static facade, you don't need to inject it into the context to use it, though you can still do so if preferred.

```ts
core.app.get('/users', async (c) => {
  const users = await DB.table('users').get()
  return c.json({ users })
})
```

## Next Steps

- Explore the [Query Builder](./query-builder.md) for more complex query features.
- Learn about [Models](./models.md) for an Active Record experience.
- Set up [Migrations & Seeding](./migrations-seeding.md) for database maintenance.

