---
title: Database Testing
description: Learn how to perform database testing in Gravito, including database resetting and using factories.
---

# Database Testing

> Gravito provides a range of tools to ensure your database logic remains correct and predictable during testing.

## Resetting the Database

Resetting the database state between tests is crucial for isolation.

### Using Migrations

You can run `migrate:fresh` within the `beforeEach` hook of your tests:

```typescript
import { PlanetCore } from '@gravito/core';

describe('User Test', () => {
  beforeEach(async () => {
    const core = await PlanetCore.boot();
    // Initialize via CLI or directly call the Migrator
    await core.pulse.call('migrate:fresh');
  });
});
```

## Using Factories

Factories allow you to randomly generate large amounts of test data.

```typescript
import { UserFactory } from '../database/factories/UserFactory';

it('can search for users', async () => {
  // Create 10 random users
  await UserFactory.new().count(10).create();

  const results = await User.where('active', true).get();
  expect(results.length).toBeGreaterThan(0);
});
```

> Learn more about [Model Factories](../database/atlas-factories.md).

## Mocking the Database

In some scenarios, you may want to avoid touching a real database (even a test one).

### Using Memory Driver

In your `gravito.config.ts`, you can configure an `sqlite:memory` or `memory` driver for the test environment.

```typescript
// gravito.config.ts
export default {
  database: {
    default: process.env.NODE_ENV === 'test' ? 'sqlite' : 'mysql',
    connections: {
      sqlite: {
        driver: 'sqlite',
        database: ':memory:',
      }
    }
  }
}
```

---

## Next Steps
Learn how to assert database changes in [HTTP Testing](../testing.md).
