---
title: Relations
---

# Relations

> Atlas provides rich support for model relationships, making it easy to define and query relationships between data tables.

## Defining Relationships

Defining relationships in a Model class is highly intuitive:

```ts
import { Model } from '@gravito/atlas'

export class User extends Model {
  static table = 'users'

  // A user has many posts
  posts() {
    return this.hasMany(Post, 'userId')
  }
}

export class Post extends Model {
  static table = 'posts'

  // A post belongs to a user
  user() {
    return this.belongsTo(User, 'userId')
  }
}
```

## Supported Relationship Types

- `hasOne(RelatedModel, foreignKey?, localKey?)`
- `hasMany(RelatedModel, foreignKey?, localKey?)`
- `belongsTo(RelatedModel, foreignKey?, ownerKey?)`
- `belongsToMany(RelatedModel, pivotTable?, foreignPivotKey?, relatedPivotKey?)`
- `morphTo(name?, typeColumn?, idColumn?)`
- `morphOne(RelatedModel, name, typeColumn?, idColumn?)`
- `morphMany(RelatedModel, name, typeColumn?, idColumn?)`

## Eager Loading

Eager loading helps you solve the N+1 query problem.

### Using `with` for Eager Loading

```ts
// Load all users and their posts
const users = await User.query().with('posts').get()

// Nested eager loading (User -> Posts -> Comments)
const users = await User.query().with('posts.comments').get()

// Multiple eager loadings
const users = await User.query().with(['posts', 'profile']).get()
```

### Lazy Eager Loading

If you already have a model instance, you can use `load`:

```ts
const user = await User.find(1)
await user.load('posts')

// Now you can access related data
const posts = user.posts // Returns ModelCollection
```

## Relationship Counts

If you only need to know the number of related records without loading the data:

```ts
const users = await User.query().withCount('posts').get()

// Each user will have a posts_count attribute
console.log(users[0].posts_count)
```

## Polymorphic Relations

Polymorphic relations allow a model to belong to more than one other model. For details, see the [ORM Usage Guide](../../guide/orm-usage.md#polymorphic-relations).
