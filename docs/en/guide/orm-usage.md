---
title: ORM Usage Guide
---

# ORM Usage Guide

> Complete guide for using Atlas ORM, covering all features and use cases. Atlas provides a Laravel Eloquent-like experience with high-performance database drivers integrated under the hood.

## Table of Contents

1. [Basic Setup](#basic-setup)
2. [Defining Models](#defining-models)
3. [CRUD Operations](#crud-operations)
4. [Query Builder](#query-builder)
5. [Relationships](#relationships)
6. [Pagination](#pagination)
7. [Transactions](#transactions)
8. [Migrations and Seeders](#migrations-and-seeders)
9. [Best Practices](#best-practices)

## Basic Setup

### 1. Install Dependencies

```bash
bun add @gravito/atlas
```

### 2. Initialize Database Connection

It is recommended to configure `DB` during your application's bootstrap phase (e.g., `bootstrap.ts`).

```typescript
import { DB } from '@gravito/atlas';

// Configure Atlas
DB.configure({
  default: 'postgres',
  connections: {
    postgres: {
      driver: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'gravito',
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    }
  }
});
```

### 3. Use in Routes

```typescript
import { DB } from '@gravito/atlas';

core.app.get('/users', async (c) => {
  // Use DB facade directly
  const users = await DB.table('users').get();
  return c.json({ users });
});
```

## Defining Models

Atlas uses the Active Record pattern. To define a model, simply inherit from the `Model` class and set the `table` name.

### Defining a User Model

```typescript
import { Model } from '@gravito/atlas';

export class User extends Model {
  // Set table name
  static table = 'users';
  
  // Primary key (defaults to 'id')
  static primaryKey = 'id';

  // Attribute type annotations (for IntelliSense)
  declare id: number;
  declare name: string;
  declare email: string;
  declare active: boolean;
}
```

### Database Migrations

Atlas provides a fluent `Blueprint` API for defining table structures. See [Migrations & Seeding](../api/atlas/migrations-seeding.md) for more details.

```ts
import { Blueprint, Schema } from '@gravito/atlas'

// Create table
await Schema.create('users', (table: Blueprint) => {
  table.id()
  table.string('name')
  table.string('email').unique()
  table.boolean('active').default(true)
  table.timestamps()
})
```

## CRUD Operations

### 1. Create & Insert

```typescript
// Create instance and save
const user = new User()
user.name = 'John Doe'
user.email = 'john@example.com'
await user.save()

// Use shorthand method
const user = await User.create({
  name: 'Jane Doe',
  email: 'jane@example.com'
})
```

### 2. Querying

```typescript
// Find by ID
const user = await User.find(1)

// Find single record (by condition)
const user = await User.where('email', 'john@example.com').first()

// Find multiple records
const users = await User.where('active', true).get()
```

### 3. Updating

```typescript
const user = await User.find(1)
if (user) {
  user.name = 'Updated Name'
  await user.save()
}
```

### 4. Deleting

```typescript
const user = await User.find(1)
await user.delete()
```

## Relationships

Similar to Laravel Eloquent, you can define relationships in your Models:

```typescript
import { Model } from '@gravito/atlas';

export class User extends Model {
  static table = 'users';
  
  posts() {
    return this.hasMany(Post, 'userId');
  }
}

export class Post extends Model {
  static table = 'posts';
  
  user() {
    return this.belongsTo(User, 'userId');
  }
}

// Usage (Lazy Loading)
const user = await User.find(1);
const posts = await user.posts; // Returns ModelCollection

// Usage (Eager Loading - Recommended to avoid N+1)
const userWithPosts = await User.query().with('posts').find(1);
```

Supported relationship types:
- `hasMany()` - One-to-many
- `belongsTo()` - Many-to-one
- `hasOne()` - One-to-one
- `belongsToMany()` - Many-to-many (requires pivot table)
- `morphTo()` - Polymorphic many-to-one
- `morphMany()` - One-to-many polymorphic
- `morphOne()` - One-to-one polymorphic

## Pagination

Atlas provide built-in pagination support. See the [Pagination Guide](../api/atlas/pagination.md).

```ts
const results = await User.query().paginate(15, 1);
```

## Transactions

### Basic Transaction

```typescript
const result = await DB.transaction(async (tx) => {
  // Perform multiple operations within the transaction
  const user = await User.query(tx).create({
    name: 'John',
    email: 'john@example.com',
  });

  const profile = await Profile.query(tx).create({
    userId: user.id,
    bio: 'Bio text',
  });

  return { user, profile };
});
```

## Migrations and Seeders

### Running Migrations

Gravito CLI provides a consistent migration workflow.

```bash
# Run pending migrations
gravito migrate

# Fresh migration (drops all tables and re-runs)
gravito migrate --fresh
```

### Running Seeders

```bash
# Run all seeders
gravito db:seed

# Run specific seeder class
gravito db:seed --class UsersSeeder
```

## Serialization

When using Atlas models, you can easily control which fields are output to JSON (e.g., hiding passwords, appending custom fields).

For details, see the [Serialization API](../api/atlas/serialization.md).

## Best Practices

1. **Use Type Safety**: Define attribute types for better IDE support.
2. **Handle Errors**: Always wrap DB operations in try-catch blocks.
3. **Use Transactions**: For complex operations involving multiple tables.
4. **Avoid N+1**: Use eager loading (`with()`) instead of manual loops.
5. **Paginate Large Data**: Never fetch thousands of records at once without pagination.
