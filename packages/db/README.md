# @gravito/db

> The Standard Database Orbit for Galaxy Architecture.

Provides seamless integration with [Drizzle ORM](https://orm.drizzle.team/) with **full PostgreSQL support and performance optimizations**.

## 📦 Installation

```bash
bun add @gravito/db drizzle-orm
```

## 🚀 Quick Start

```typescript
import { PlanetCore } from 'gravito-core';
import orbitDB from '@gravito/db';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const core = new PlanetCore();
const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

// Register the orbit
orbitDB(core, {
  db,
  databaseType: 'postgresql', // 完整支援 PostgreSQL
  exposeAs: 'db'
});

// Use in routes
core.app.get('/users', async (c) => {
  const db = c.get('db'); // DBService instance
  const users = await db.raw.select().from(users); // 或使用 db.findById(), db.findOne() 等
  return c.json({ users });
});
```

## ✨ Features

- ✅ **Model Classes** - Laravel Eloquent-like Model API (`User.find()`, `User.create()`, etc.) with Drizzle performance
- ✅ **Transaction Support** - Full PostgreSQL transaction support
- ✅ **Complete CRUD Operations** - `create()`, `insert()`, `update()`, `delete()`, `findById()`, `findOne()`, `findAll()`, `count()`, `exists()`, `paginate()`
- ✅ **Bulk Operations** - `bulkInsert()`, `bulkUpdate()`, `bulkDelete()` with transaction support
- ✅ **Relation Queries** - `findByIdWith()`, `findOneWith()`, `findAllWith()` for querying with relations
- ✅ **Polymorphic Relations** - `morphTo()`, `morphMany()`, `morphOne()` for flexible polymorphic associations
- ✅ **Query Builder** - Fluent query builder with chainable methods (`where()`, `orderBy()`, `limit()`, etc.)
- ✅ **Soft Deletes** - Soft delete support with `delete()`, `forceDelete()`, `restore()`, `trashed()`
- ✅ **Fillable/Guarded** - Mass assignment protection
- ✅ **Timestamps** - Automatic `created_at` and `updated_at` management
- ✅ **Scopes** - Local and global scopes for reusable query constraints
- ✅ **Model Events** - Lifecycle hooks (`creating`, `created`, `updating`, `updated`, `saving`, `saved`, `deleting`, `deleted`)
- ✅ **Type Casting** - Automatic attribute type conversion
- ✅ **Accessors & Mutators** - Custom getters and setters for attributes
- ✅ **Collections** - Laravel-like collection class for model arrays
- ✅ **Chunk & Cursor** - Efficient batch processing for large datasets
- ✅ **With Count** - Eager loading relation counts
- ✅ **Health Check** - Database connection health monitoring
- ✅ **Query Logging** - Optional query logging (async, non-blocking)
- ✅ **Migration Support** - `migrate()` and `migrateTo()` methods for database migrations
- ✅ **Seeder Support** - `seed()` and `seedMany()` methods for database seeding
- ✅ **Deployment Support** - `deploy()` method for automated database deployment
- ✅ **Hooks System** - Comprehensive hooks for all operations
- ✅ **PostgreSQL Optimized** - All features optimized for PostgreSQL performance

## 📚 Documentation

For detailed API documentation, examples, and advanced usage, see:
- [中文文檔](../../docs/zh-TW/api/orbit-db.md)
- [English Docs](../../docs/en/api/orbit-db.md)
