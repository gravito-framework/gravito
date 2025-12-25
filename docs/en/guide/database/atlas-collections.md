# Eloquent Collections

In Laravel Eloquent, query results return a powerful `Collection` instance. However, Atlas ORM takes a different philosophical approach.

Methods like `all()` and `get()` in Atlas return **Standard JavaScript Arrays (Native Arrays)**.

## Why Native Arrays?

1.  **Zero Learning Curve**: Every JavaScript/TypeScript developer already knows how to manipulate arrays.
2.  **Performance**: Native arrays are highly optimized in modern JavaScript engines with no wrapper overhead.
3.  **Interoperability**: Arrays work seamlessly with any third-party library (like Lodash, Ramda) without conversion.
4.  **Type Safety**: TypeScript support for native arrays is best-in-class.

While there is no dedicated `Collection` class, JavaScript's Array Methods are powerful enough to cover the vast majority of use cases.

## Common Operations

Here is a comparison between Laravel Collection methods and native JavaScript array operations:

### Iterating (Each)

```typescript
const users = await User.all();

// Laravel: $users->each(...)
users.forEach(user => {
  console.log(user.name);
});

// Or use for...of (Recommended)
for (const user of users) {
  console.log(user.name);
}
```

### Mapping (Map)

```typescript
// Laravel: $users->map(...)
const names = users.map(user => user.name);
```

### Filtering (Filter / Reject)

```typescript
// Laravel: $users->filter(...)
const admins = users.filter(user => user.role === 'admin');

// Laravel: $users->reject(...)
const nonAdmins = users.filter(user => user.role !== 'admin');
```

### Finding (Find / First)

```typescript
// Laravel: $users->first(...)
const firstUser = users[0]; // Or users.find(u => condition)

// Laravel: $users->firstWhere('role', 'admin')
const admin = users.find(user => user.role === 'admin');
```

### Pluck

Atlas has no built-in `pluck`, but `map` achieves the same result easily:

```typescript
// Laravel: $users->pluck('id')
const ids = users.map(user => user.id);
```

### Checking for Empty (isEmpty / isNotEmpty)

```typescript
// Laravel: $users->isEmpty()
if (users.length === 0) {
  // ...
}

// Laravel: $users->isNotEmpty()
if (users.length > 0) {
  // ...
}
```

## Advanced Operations

For more complex collection operations, you can use `reduce` or introduce a utility library like [Lodash](https://lodash.com/).

### KeyBy

Convert an array into an object keyed by ID:

```typescript
// Laravel: $users->keyBy('id')
const usersById = users.reduce((acc, user) => {
  acc[user.id] = user;
  return acc;
}, {} as Record<number, User>);
```

### GroupBy

Use modern JavaScript's `Object.groupBy` (Node.js 21+ / Bun 1.0+):

```typescript
// Laravel: $users->groupBy('role')
const usersByRole = Object.groupBy(users, ({ role }) => role);
```

Or use `reduce`:

```typescript
const usersByRole = users.reduce((acc, user) => {
  (acc[user.role] ||= []).push(user);
  return acc;
}, {} as Record<string, User[]>);
```

### Chunk

If you need to split an array into smaller chunks (e.g., for UI grid layouts):

```typescript
// Laravel: $users->chunk(3)
function chunk<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

const chunkedUsers = chunk(users, 3);
```

## Conclusion

Atlas chooses to embrace the native JavaScript ecosystem. By mastering array methods like `map`, `filter`, and `reduce`, you can achieve a development experience that is just as powerful and efficient as Laravel Collections.
