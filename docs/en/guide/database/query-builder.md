# Query Builder

Atlas provides a fluent query builder that allows you to construct complex database queries without writing raw SQL or Mongo query objects. It provides a unified interface across different drivers.

## Basic Where Clauses

### `where`

The most basic call is `where`. It accepts a field, an operator (optional), and a value.

```typescript
// Implicit '=' operator
const users = await User.where('role', 'admin').get();

// Explicit operator
const activeUsers = await User.where('logins', '>=', 5).get();

// Nested keys (Driver permitting)
const users = await User.where('meta.is_subscribed', true).get();
```

### `orWhere`

To add an `OR` condition, use `orWhere`.

```typescript
// role = 'admin' OR role = 'moderator'
const staff = await User.where('role', 'admin')
                        .orWhere('role', 'moderator')
                        .get();
```

### `whereIn` / `whereNotIn`

Check if a column's value is contained within a given array.

```typescript
const users = await User.whereIn('id', [1, 2, 3]).get();
```

## Ordering and Pagination

### `orderBy`

Sort the results by a given column. The second argument controls direction (`asc` or `desc`).

```typescript
const newestUsers = await User.orderBy('createdAt', 'desc').get();
```

### `skip` and `take` (Offset / Limit)

```typescript
// Get 10 users, skipping the first 5
const users = await User.skip(5).take(10).get();
```

## Retrieving Results

### `get()`

Executes the query and returns an array of model instances.

```typescript
const users = await User.where('active', true).get();
```

### `first()`

Executes the query and returns the first matching model instance, or `null`.

```typescript
const user = await User.where('email', 'foo@bar.com').first();
```

### `count()`

Returns the integer count of matching records.

```typescript
const count = await User.where('active', true).count();
```

### `exists()`

Returns `true` if any records match the query.

```typescript
if (await User.where('email', email).exists()) {
    // ...
}
```

## Advanced Clauses

### `whereNull` / `whereNotNull`

```typescript
const incomplete = await Task.whereNull('completedAt').get();
```

### `whereDate` (Coming Soon)

Driver-specificdate comparisons.

## Raw Queries

If you need to bypass the builder, you can often access the underlying driver instance, though this breaks driver agnosticism.

```typescript
// Specific to MongoDB driver usage if exposed
await User.collection.aggregate([...]); 
```
