# Database & ORM (Atlas)

Atlas is Gravito's native Object-Relational Mapper (ORM), designed to provide an elegant ActiveRecord implementation for modern TypeScript applications. It draws heavy inspiration from Laravel's Eloquent but is rebuilt from the ground up to leverage TypeScript's static analysis and Bun's performance.

::: info 🚧 **Alpha Status**
Atlas is currently in **Active Alpha**. While the core features (Models, Relationships, Query Builder) are functional, the API may undergo changes before the 1.0 stable release. The current focus is on MongoDB support, with Redis and SQL drivers in development.
:::

## Why Atlas?

Interacting with databases should be intuitive and expressive. Atlas removes the boilerplate of manual query construction, allowing you to interact with your data using clear, object-oriented syntax.

```typescript
// Create a new user
const user = await User.create({
  name: 'Carl',
  email: 'carl@gravito.dev'
});

// Find and update
const post = await Post.where('slug', 'hello-world').first();
post.title = 'Hello Gravito';
await post.save();
```

## Core Features

### 1. ActiveRecord Pattern
Each database table (or collection) has a corresponding "Model" that is used to interact with that table. You can query for data in your tables, as well as insert new records into the table.

### 2. Multi-Driver Support
Atlas is designed to be database-agnostic.
- **MongoDB**: First-class support with a fluent query builder that mimics SQL-like syntax.
- **Redis**: Native support for high-performance key-value storage and caching.
- **SQL (Coming Soon)**: Planned support for PostgreSQL, MySQL, and SQLite.

### 3. Rich Relationships
Define relationships between models using expressive methods:
- One to One
- One to Many
- Many to Many (Coming Soon)
- Polymorphic Relations (Coming Soon)

### 4. Advanced Features
- **Observers**: Hook into model lifecycle events (creating, updated, deleted).
- **Scopes**: Reusable query constraints.
- **Casting**: Automatically transform attributes (e.g., JSON, Date, Boolean).

## Architecture

Atlas is built on top of the `@gravito/atlas` package. It sits independently of the HTTP layer, meaning you can use it in CLI commands, queue workers, or even standalone scripts.

```mermaid
graph TD
    A[Application Code] --> B[Atlas Model]
    B --> C[Query Builder]
    C --> D[Driver Adapter (Mongo/Redis/SQL)]
    D --> E[Database]
```

## Next Steps

Ready to dive in? Start by configuring your database connection.

- [Quick Start](./quick-start)
- [Query Builder](./query-builder)
- [Migrations](./migrations)
