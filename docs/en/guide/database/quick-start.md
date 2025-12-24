# Quick Start with Atlas

This guide will walk you through setting up a database connection, defining a model, and performing basic CRUD operations.

## 1. Installation

Atlas runs on top of the `@gravito/atlas` package. If you are using `create-gravito-app`, it is likely already installed.

```bash
bun add @gravito/atlas typescript
```

Depending on your database, you also need the underlying driver:

```bash
# For MongoDB
bun add mongodb

# For Redis
bun add ioredis
```

## 2. Configuration

Configure your database connections in `src/config/database.ts`. Atlas supports multiple connections.

```typescript
import { Env } from '@gravito/core';

export default {
  default: Env.get('DB_CONNECTION', 'mongodb'),

  connections: {
    mongodb: {
      driver: 'mongodb',
      url: Env.get('DB_URI', 'mongodb://localhost:27017/gravito'),
      database: Env.get('DB_DATABASE', 'gravito'),
    },
    
    redis: {
      driver: 'redis',
      host: Env.get('REDIS_HOST', '127.0.0.1'),
      port: Env.get('REDIS_PORT', 6379),
    }
  }
}
```

## 3. Define a Model

Models typically live in `src/models`. A model extends the `Model` class and defines its structure.

```typescript
import { Model } from '@gravito/atlas';

export interface UserAttributes {
  _id?: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt?: Date;
  updatedAt?: Date;
}

export class User extends Model<UserAttributes> {
  // Collection name (optional, auto-inferred from class name)
  static collection = 'users';

  // Default attribute values
  protected attributes: Partial<UserAttributes> = {
    role: 'user'
  };

  // Hidden fields in JSON output
  protected hidden = ['password'];

  // Type Casting
  protected casts = {
    email: 'string',
    role: 'string',
    createdAt: 'date'
  };
}
```

## 4. Basic Usage

Once your model is defined, you can start interacting with the database.

### Creating Records

```typescript
const user = await User.create({
  name: 'Alice',
  email: 'alice@example.com'
});

console.log(user._id); // Auto-generated ID
```

### Retrieving Records

```typescript
// Find by ID
const user = await User.find('65a...');

// Find by Condition
const admin = await User.where('role', 'admin').first();

// Get All
const allUsers = await User.all();
```

### Updating Records

```typescript
const user = await User.find('...');
user.name = 'Alice Wonderland';
await user.save();

// Or bulk update
await User.where('role', 'user').update({ active: true });
```

### Deleting Records

```typescript
const user = await User.find('...');
await user.delete();

// Or bulk delete
await User.destroy('...'); // by ID
```

## Next Steps

- Explore the [Query Builder](./query-builder) for complex queries.
- Learn about [Relationships](./relationships) to link models.
