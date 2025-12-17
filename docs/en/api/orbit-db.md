---
title: Orbit DB
---

# Orbit DB

> Database integration as a Gravito Orbit with **full PostgreSQL support and performance optimizations**.

Package: `@gravito/orbit-db`

This Orbit integrates **Drizzle ORM**, providing standardized database connection, context injection, transaction support, query helpers, health checks, and hooks.

## Installation

```bash
bun add @gravito/orbit-db drizzle-orm
```

## Quick Start

### PostgreSQL (Recommended)

```typescript
import { PlanetCore } from 'gravito-core';
import orbitDB from '@gravito/orbit-db';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const core = new PlanetCore();
const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

// Initialize DB Orbit (Full PostgreSQL support)
orbitDB(core, {
  db,
  databaseType: 'postgresql', // Explicitly specify PostgreSQL for optimal performance
  exposeAs: 'db'
});

// Use in routes
core.app.get('/users', async (c) => {
  const db = c.get('db'); // DBService instance
  // Use query helpers
  const user = await db.findById(users, 1);
  // Or use raw Drizzle instance
  const allUsers = await db.raw.select().from(users);
  return c.json({ user, allUsers });
});
```

### SQLite

```typescript
import { PlanetCore } from 'gravito-core';
import orbitDB from '@gravito/orbit-db';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';

const core = new PlanetCore();
const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite);

orbitDB(core, {
  db,
  exposeAs: 'db'
});
```

## API Reference

### OrbitDBOptions

```typescript
interface OrbitDBOptions {
  db: any; // Drizzle database instance
  schema?: Record<string, unknown>;
  exposeAs?: string; // Default: 'db'
  enableQueryLogging?: boolean; // Default: false
  queryLogLevel?: 'debug' | 'info' | 'warn' | 'error'; // Default: 'debug'
  enableHealthCheck?: boolean; // Default: true
  healthCheckQuery?: string; // Default: 'SELECT 1' (PostgreSQL optimized)
  databaseType?: 'postgresql' | 'sqlite' | 'mysql' | 'auto'; // Default: 'auto'
}
```

### DBService Methods

#### `raw`

Get the raw Drizzle instance (backward compatibility):

```typescript
const db = c.get('db');
const drizzleDb = db.raw; // Raw Drizzle instance
```

#### `transaction<T>(callback: (tx) => Promise<T>): Promise<T>`

Execute database transaction (full PostgreSQL transaction support):

```typescript
const result = await db.transaction(async (tx) => {
  const user = await tx.insert(users).values({ name: 'John' });
  const profile = await tx.insert(profiles).values({ userId: user.id });
  return { user, profile };
});
```

#### `findById<T>(table, id): Promise<T | null>`

Find a record by ID:

```typescript
const user = await db.findById(users, 1);
```

#### `findOne<T>(table, where): Promise<T | null>`

Find a single record:

```typescript
const user = await db.findOne(users, { email: 'user@example.com' });
```

#### `findAll<T>(table, where?, options?): Promise<T[]>`

Find all records (with optional conditions and sorting):

```typescript
// Find all records
const allUsers = await db.findAll(users);

// With conditions
const activeUsers = await db.findAll(users, { status: 'active' });

// With sorting and limit
const recentUsers = await db.findAll(users, undefined, {
  orderBy: users.createdAt,
  orderDirection: 'desc',
  limit: 10
});
```

#### `count(table, where?): Promise<number>`

Count records:

```typescript
const totalUsers = await db.count(users);
const activeUsersCount = await db.count(users, { status: 'active' });
```

#### `exists(table, where): Promise<boolean>`

Check if record exists:

```typescript
const userExists = await db.exists(users, { email: 'user@example.com' });
```

#### `findByIdWith<T>(tableName, id, relations): Promise<T | null>`

Find record by ID with relations (requires Drizzle relations to be defined):

```typescript
// Assuming relations are defined between users and posts
const user = await db.findByIdWith('users', 1, {
  posts: true,           // Load all posts
  profile: true,         // Load profile
  posts: {              // Nested relations
    comments: true
  }
});
```

#### `findOneWith<T>(tableName, where, relations): Promise<T | null>`

Find single record with relations:

```typescript
const user = await db.findOneWith('users', { email: 'john@example.com' }, {
  posts: true,
  profile: true
});
```

#### `findAllWith<T>(tableName, relations, options?): Promise<T[]>`

Find all records with relations:

```typescript
const users = await db.findAllWith('users', { posts: true }, {
  where: { status: 'active' },
  limit: 10
});
```

**Note**: Relation query methods use Drizzle's `query` API, which requires relations to be defined first. If relations are not defined, you can use `db.raw.query` directly.

#### `paginate<T>(table, options): Promise<PaginateResult<T>>`

Paginated query (optimized for PostgreSQL using `LIMIT/OFFSET`):

```typescript
const result = await db.paginate(users, {
  page: 1,
  limit: 10,
  orderBy: users.createdAt,
  orderDirection: 'desc'
});

// result.data - Array of data
// result.pagination - Pagination info
//   - page: Current page number
//   - limit: Items per page
//   - total: Total records
//   - totalPages: Total pages
//   - hasNext: Has next page
//   - hasPrev: Has previous page
```

#### `healthCheck(): Promise<HealthCheckResult>`

Check database connection health (PostgreSQL uses lightweight `SELECT 1` query):

```typescript
const health = await db.healthCheck();
// { status: 'healthy' | 'unhealthy', latency?: number, error?: string }
```

#### `migrate(): Promise<MigrateResult>`

Execute all pending database migrations:

```typescript
const result = await db.migrate();
// { success: boolean, appliedMigrations?: string[], error?: string }
```

#### `migrateTo(targetMigration?: string): Promise<MigrateResult>`

Migrate to a specific migration version:

```typescript
const result = await db.migrateTo('001_initial');
// { success: boolean, appliedMigrations?: string[], error?: string }
```

#### `seed(seedFunction: SeedFunction, seedName?: string): Promise<SeedResult>`

Execute seed data:

```typescript
const seedFunction = async (db) => {
  await db.insert(users).values([
    { name: 'John', email: 'john@example.com' },
    { name: 'Jane', email: 'jane@example.com' },
  ]);
};

const result = await db.seed(seedFunction, 'users-seed');
// { success: boolean, seededFiles?: string[], error?: string }
```

#### `seedMany(seedFunctions: Array<{ name: string; seed: SeedFunction }>): Promise<SeedResult>`

Execute multiple seed functions:

```typescript
const result = await db.seedMany([
  { name: 'users-seed', seed: usersSeedFunction },
  { name: 'posts-seed', seed: postsSeedFunction },
]);
// { success: boolean, seededFiles?: string[], error?: string }
```

#### `create<T>(table, data): Promise<T>`

Create a single record:

```typescript
const newUser = await db.create(users, {
  name: 'John',
  email: 'john@example.com'
});
```

#### `insert<T>(table, data): Promise<T | T[]>`

Insert records (supports single or multiple):

```typescript
// Single insert
const user = await db.insert(users, { name: 'John', email: 'john@example.com' });

// Multiple inserts
const users = await db.insert(users, [
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' }
]);
```

#### `update<T>(table, where, data): Promise<T[]>`

Update records:

```typescript
const updatedUsers = await db.update(users, { id: 1 }, { name: 'John Updated' });
```

#### `delete(table, where): Promise<void>`

Delete records:

```typescript
await db.delete(users, { id: 1 });
```

#### `bulkInsert<T>(table, data): Promise<T[]>`

Bulk insert:

```typescript
const newUsers = await db.bulkInsert(users, [
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' },
  { name: 'Bob', email: 'bob@example.com' }
]);
```

#### `bulkUpdate<T>(table, updates): Promise<T[]>`

Bulk update (executed in transaction):

```typescript
const updatedUsers = await db.bulkUpdate(users, [
  { where: { id: 1 }, data: { name: 'John Updated' } },
  { where: { id: 2 }, data: { name: 'Jane Updated' } }
]);
```

#### `bulkDelete(table, whereConditions): Promise<void>`

Bulk delete (executed in transaction):

```typescript
await db.bulkDelete(users, [
  { id: 1 },
  { id: 2 },
  { id: 3 }
]);
```

#### `deploy(options?: DeployOptions): Promise<DeployResult>`

Deploy database (run migrations and seeds, suitable for production deployment):

```typescript
const result = await db.deploy({
  runMigrations: true,      // Run migrations (default: true)
  runSeeds: false,          // Run seeds (default: false)
  skipHealthCheck: false,   // Skip health check (default: false)
  validateBeforeDeploy: true, // Validate before deploy (default: true)
});
// { success: boolean, migrations?: MigrateResult, seeds?: SeedResult, healthCheck?: HealthCheckResult, error?: string }
```

## Hooks

### `db:connected`

Fired when DB Orbit is successfully registered:

```typescript
core.hooks.addAction('db:connected', ({ db, dbService, databaseType }) => {
  console.log(`Database connected: ${databaseType}`);
});
```

### `db:query`

Fired on each query execution (requires query logging enabled):

```typescript
core.hooks.addAction('db:query', ({ query, params, duration, timestamp }) => {
  console.log(`Query: ${query}, Duration: ${duration}ms`);
});
```

### `db:transaction:start`

Fired when a transaction starts:

```typescript
core.hooks.addAction('db:transaction:start', ({ transactionId, startTime }) => {
  console.log(`Transaction started: ${transactionId}`);
});
```

### `db:transaction:commit`

Fired when a transaction commits:

```typescript
core.hooks.addAction('db:transaction:commit', ({ transactionId, duration }) => {
  console.log(`Transaction committed: ${transactionId} (${duration}ms)`);
});
```

### `db:transaction:rollback`

Fired when a transaction rolls back:

```typescript
core.hooks.addAction('db:transaction:rollback', ({ transactionId, duration }) => {
  console.log(`Transaction rolled back: ${transactionId} (${duration}ms)`);
});
```

### `db:transaction:error`

Fired when a transaction error occurs:

```typescript
core.hooks.addAction('db:transaction:error', ({ transactionId, error, duration }) => {
  console.error(`Transaction error: ${transactionId}`, error);
});
```

### `db:health-check`

Fired during health check:

```typescript
core.hooks.addAction('db:health-check', ({ status, latency, error }) => {
  console.log(`Health check: ${status}, Latency: ${latency}ms`);
});
```

### `db:migrate:start`

Fired when migration starts:

```typescript
core.hooks.addAction('db:migrate:start', ({ targetMigration, timestamp }) => {
  console.log(`Migration started${targetMigration ? ` to ${targetMigration}` : ''}`);
});
```

### `db:migrate:complete`

Fired when migration completes:

```typescript
core.hooks.addAction('db:migrate:complete', ({ targetMigration, appliedMigrations, duration, timestamp }) => {
  console.log(`Migration completed: ${appliedMigrations.length} migrations applied`);
});
```

### `db:migrate:error`

Fired when migration error occurs:

```typescript
core.hooks.addAction('db:migrate:error', ({ targetMigration, error, duration, timestamp }) => {
  console.error(`Migration failed${targetMigration ? ` to ${targetMigration}` : ''}`, error);
});
```

### `db:seed:start`

Fired when seed starts:

```typescript
core.hooks.addAction('db:seed:start', ({ seedName, seedCount, timestamp }) => {
  console.log(`Seed started: ${seedName || `${seedCount} seeds`}`);
});
```

### `db:seed:complete`

Fired when seed completes:

```typescript
core.hooks.addAction('db:seed:complete', ({ seedName, seededFiles, duration, timestamp }) => {
  console.log(`Seed completed: ${seedName || seededFiles?.join(', ')}`);
});
```

### `db:seed:error`

Fired when seed error occurs:

```typescript
core.hooks.addAction('db:seed:error', ({ seedName, error, errors, duration, timestamp }) => {
  console.error(`Seed failed: ${seedName || 'multiple seeds'}`, error || errors);
});
```

### `db:deploy:start`

Fired when deployment starts:

```typescript
core.hooks.addAction('db:deploy:start', ({ options, timestamp }) => {
  console.log('Database deployment started');
});
```

### `db:deploy:complete`

Fired when deployment completes:

```typescript
core.hooks.addAction('db:deploy:complete', ({ migrateResult, seedResult, healthCheckResult, duration, timestamp }) => {
  console.log('Database deployment completed successfully');
});
```

### `db:deploy:error`

Fired when deployment error occurs:

```typescript
core.hooks.addAction('db:deploy:error', ({ error, duration, timestamp }) => {
  console.error('Database deployment failed', error);
});
```

## PostgreSQL Performance Optimizations

All features are optimized for PostgreSQL performance:

- **Transaction Support**: Full PostgreSQL transaction features (SAVEPOINT, ROLLBACK TO SAVEPOINT, etc.)
- **Paginated Queries**: Uses PostgreSQL standard `LIMIT/OFFSET` syntax
- **Health Check**: Uses lightweight `SELECT 1` query
- **Query Logging**: Async logging, non-blocking query execution

## Advanced Usage

### Enable Query Logging

```typescript
orbitDB(core, {
  db,
  enableQueryLogging: true,
  queryLogLevel: 'info' // 'debug' | 'info' | 'warn' | 'error'
});
```

### Custom Health Check Query

```typescript
orbitDB(core, {
  db,
  healthCheckQuery: 'SELECT 1 FROM pg_stat_activity LIMIT 1' // PostgreSQL specific query
});
```

### Custom exposeAs

```typescript
orbitDB(core, {
  db,
  exposeAs: 'database' // Access via c.get('database')
});
```

## Complete Usage Guide

For a detailed ORM usage guide with complete examples and best practices, see:

- [ORM Usage Guide (English)](../guide/orm-usage.md)
- [ORM 使用指南（中文）](../zh-TW/guide/orm-usage.md)

## Relations (關聯查詢)

Drizzle ORM supports powerful relation query functionality. To use relation queries, you need to define relations first:

### Defining Relations

```typescript
import { relations } from 'drizzle-orm';
import { pgTable, integer, text } from 'drizzle-orm/pg-core';

const users = pgTable('users', {
  id: integer('id').primaryKey(),
  name: text('name'),
});

const posts = pgTable('posts', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  title: text('title'),
});

// Define relations
const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

const postsRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));

// Include relations when creating Drizzle instance
const db = drizzle(client, { schema: { users, posts, usersRelations, postsRelations } });
```

### Using Relation Queries

```typescript
// Query user with all posts
const user = await db.findByIdWith('users', 1, { posts: true });

// Nested relations
const user = await db.findByIdWith('users', 1, {
  posts: {
    comments: true  // Load comments for posts
  }
});

// Or use Drizzle's query API directly
const user = await db.raw.query.users.findFirst({
  where: eq(users.id, 1),
  with: { posts: true }
});
```
