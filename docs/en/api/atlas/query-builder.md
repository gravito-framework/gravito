---
title: Query Builder
---

# Query Builder

> Atlas’s Query Builder provides a fluent, easy-to-use interface for building and executing database queries.

## Basic Usage

Start a query for a specific table via `DB.table()`.

```ts
import { DB } from '@gravito/atlas'

const users = await DB.table('users').get()
```

## Selects

```ts
// Specify columns
const users = await DB.table('users').select('id', 'name', 'email').get()

// Distinct queries
const distinctRoles = await DB.table('users').distinct().select('role').get()

// Raw SQL select
const users = await DB.table('users')
  .selectRaw('COUNT(*) as count, status')
  .groupBy('status')
  .get()
```

## Where Clauses

### Basic Where

```ts
// Basic comparison
const user = await DB.table('users').where('id', 1).first()

// Specify operator
const items = await DB.table('products').where('price', '>', 100).get()

// Multiple conditions (AND)
const items = await DB.table('users')
  .where('active', true)
  .where('role', 'admin')
  .get()

// OR Where
const items = await DB.table('users')
  .where('id', 1)
  .orWhere('email', 'admin@example.com')
  .get()
```

### Advanced Queries

#### Where In / Between / Null

```ts
// Where In
const roles = await DB.table('users').whereIn('id', [1, 2, 3]).get()

// Where Between
const users = await DB.table('users').whereBetween('votes', [1, 100]).get()

// Where Null / Not Null
const users = await DB.table('users').whereNull('updated_at').get()
```

#### JSON Queries

Atlas supports deep queries on JSON columns (currently supported on PostgreSQL, MySQL, SQLite).

```ts
// Check value at JSON path
const users = await DB.table('users')
  .whereJson('settings->theme', 'dark')
  .get()

// Check if JSON contains specific object/value
const users = await DB.table('users')
  .whereJsonContains('options', { beta: true })
  .get()
```

#### Nested Conditions

```ts
const users = await DB.table('users')
  .where('email', 'like', '%@example.com')
  .where((query) => {
    query.where('votes', '>', 100).orWhere('title', 'Admin')
  })
  .get()
```

## Joins

```ts
const users = await DB.table('users')
  .join('profiles', 'users.id', '=', 'profiles.user_id')
  .select('users.*', 'profiles.avatar')
  .get()

// Left Join
const posts = await DB.table('posts')
  .leftJoin('comments', 'posts.id', '=', 'comments.post_id')
  .get()
```

## Ordering, Grouping, Limit

```ts
// Order By
const users = await DB.table('users').orderBy('name', 'desc').get()
const latest = await DB.table('users').latest().get()

// Group By & Having
const stats = await DB.table('orders')
  .groupBy('status')
  .having('count', '>', 5)
  .selectRaw('status, COUNT(*) as count')
  .get()

// Limit & Offset
const users = await DB.table('users').skip(10).take(5).get()
```

## Aggregates

```ts
const count = await DB.table('users').count()
const maxPrice = await DB.table('products').max('price')
const average = await DB.table('users').avg('age')
const sum = await DB.table('orders').sum('total')
```

## Pagination

Atlas provide built-in pagination support. See [Pagination](./pagination.md) for details.

```ts
const results = await DB.table('users').paginate(15, 1)
```
