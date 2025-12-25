# Database Seeding

Atlas includes the ability to seed your database with test data using seed classes.

## Writing Seeders

Seeders are stored in the `database/seeders` directory. A seeder class contains a `run` method where you can insert data into your database.

```typescript
import { Seeder } from '@gravito/atlas';
import User from '../src/models/User';

export default class DatabaseSeeder extends Seeder {
  async run() {
    await User.query().insert({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'password'
    });
  }
}
```

## Using Model Factories

In addition to manual insertion, you can use [Model Factories](./atlas-factories) to quickly generate large amounts of test data.

```typescript
import { Factory } from '@gravito/atlas';
import User from '../src/models/User';

export default class UserSeeder extends Seeder {
  async run() {
    // Create 10 users using the factory
    await Factory.model(User).count(10).create();
  }
}
```

> For detailed factory definition and usage, please refer to the [Model Factories Documentation](./atlas-factories).

## Calling Additional Seeders

Within the `run` method of a Seeder class, you can use the `call` method to execute other seed classes. This allows you to break up your database seeding into multiple files, preventing a single seeder file from becoming too large:

```typescript
export default class DatabaseSeeder extends Seeder {
  async run() {
    await this.call([
      UserSeeder,
      PostSeeder,
      CommentSeeder,
    ]);
  }
}
```

## Running Seeders

To seed your database, execute the `db:seed` Orbit command:

```bash
bun orbit db:seed
```

You can also specify a specific seeder class to run:

```bash
bun orbit db:seed --class=UserSeeder
```

## Production Environment Warning

By default, if you attempt to run seeders in a `production` environment, the system will issue a warning as this may overwrite real data. To force execution, use the `--force` flag:

```bash
bun orbit db:seed --force
```