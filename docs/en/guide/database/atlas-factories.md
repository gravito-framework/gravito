# Model Factories

When testing your application or seeding your database, you may need to insert a few records into your database. Instead of manually specifying the value of each column, Atlas allows you to define a set of default attributes for each of your models using model factories.

## Defining Factories

Factories are typically defined in your project configuration or a dedicated `database/factories` directory. Use the `Factory.define` method to define a factory.

Since Atlas does not bundle Faker, you need to install and import `@faker-js/faker` yourself:

```bash
bun add -D @faker-js/faker
```

```typescript
import { Factory } from '@gravito/atlas';
import { faker } from '@faker-js/faker';
import { User } from './User';

// Define a factory for the User model
Factory.define(User, () => {
  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    password: 'password', // Default password
    is_active: true,
  };
});
```

## Creating Models

Once you have defined your factories, you may use the static `Factory.model(User)` method to utilize them.

### Instantiating Models

The `make` method creates model instances but does **not** save them to the database:

```typescript
const user = Factory.model(User).makeOne();
```

To create a collection of many models:

```typescript
const users = Factory.model(User).count(3).make();
```

### Persisting Models

The `create` method creates model instances and saves them to the database using the `insert` method:

```typescript
// Create and save a single user
const user = await Factory.model(User).create();

// Create and save 3 users
const users = await Factory.model(User).count(3).create();
```

You can also override attributes when creating:

```typescript
const user = await Factory.model(User).create({
  name: 'Carl',
  email: 'carl@example.com'
});
```

## Factory States

States allow you to define discrete modifications that can be applied to your model factories. For example, you might want to create a user in a "suspended" state:

```typescript
const user = await Factory.model(User)
  .state({ is_active: false })
  .create();
```

You can chain multiple state calls:

```typescript
const user = await Factory.model(User)
  .state({ is_active: true })
  .state({ role: 'admin' })
  .create();
```

## Factory Sequences

Sometimes you may wish to alternate the value of a given attribute for each created model. For instance, you might want to alternate between creating admins and users:

```typescript
const users = await Factory.model(User)
  .count(10)
  .sequence('role', (index) => (index % 2 === 0 ? 'admin' : 'user'))
  .create();
```

This will create 10 users with roles: admin, user, admin, user...

## Factory Relationships

While Atlas factories do not yet have built-in relationship methods (like `has` or `for`), you can easily create related data manually.

### Creating Related Models

```typescript
// 1. Create parent model
const user = (await Factory.model(User).create())[0];

// 2. Create child models belonging to the parent
await Factory.model(Post)
  .count(3)
  .state({ user_id: user.id }) // Set foreign key
  .create();
```

This is the recommended way to seed related data in your Seeders.
