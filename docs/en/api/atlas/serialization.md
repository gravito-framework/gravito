---
title: Serialization
---

# Serialization

> Learn how to convert Atlas models into JSON and arrays, controlling which attributes are included, hiding sensitive data, and appending custom fields.

## Basic Serialization

When you return a model instance as a response or call `JSON.stringify(model)`, Atlas automatically calls the `toJSON()` method.

```ts
const user = await User.find(1)

// Automatically converted to JSON
return c.json(user)

// Manually convert to an object
const data = user.toJSON()
```

## Hiding Attributes (Hidden)

Sometimes you might want to hide certain sensitive fields (like passwords or tokens) from the output JSON. You can define these using the static `hidden` property:

```ts
export class User extends Model {
  static hidden = ['password', 'remember_token']
}
```

## Making Attributes Visible

Conversely, you can use a "whitelist" mode to only output specific fields using the `visible` property:

```ts
export class User extends Model {
  static visible = ['name', 'email']
}
```

> **Note**: If `visible` is defined, `hidden` will be ignored.

## Appending Attributes (Appends)

If you have custom Accessors and want them to be included in the JSON output, use the `appends` property:

```ts
export class User extends Model {
  static appends = ['is_admin']

  // Define accessor
  get isAdmin() {
    return this.role === 'admin'
  }
}
```

## Serializing Relationships

When you eager load relationships using `with()`, the related data is automatically serialized as well:

```ts
const user = await User.query().with('posts').first()

// The output JSON will contain a 'posts' array
return c.json(user)
```

---

## Next Steps
Learn how to handle complex data structures with [Model Relationships](./relations.md).
