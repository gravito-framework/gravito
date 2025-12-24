# Database Migrations

Migrations are like version control for your database, allowing your team to define and share the application's database schema definition. If you have ever had to tell a teammate to manually add a column to their local database schema, you've faced the problem that database migrations solve.

## Introduction

Gravito provides a robust migration system via its `Pulse` CLI and `Atlas` ORM. Migrations are typically stored in the `database/migrations` directory.

## Generating Migrations

To create a new migration, use the `make:migration` command using Pulse.

```bash
bun pulse make:migration create_users_table
```

This will create a new file in `database/migrations` with a timestamp prefix, ensuring they run in the correct order.

## Migration Structure

A migration class contains two methods: `up` and `down`. The `up` method is used to add new tables, columns, or indexes to your database, while the `down` method should reverse the operations performed by the `up` method.

```typescript
import { Migration, Schema, Blueprint } from '@gravito/atlas';

export default class CreateUsersTable extends Migration {
  /**
   * Run the migrations.
   */
  public async up(): Promise<void> {
    await Schema.create('users', (table: Blueprint) => {
      table.id();
      table.string('name');
      table.string('email').unique();
      table.string('password');
      table.timestamps(); // Creates createdAt and updatedAt
    });
  }

  /**
   * Reverse the migrations.
   */
  public async down(): Promise<void> {
    await Schema.dropIfExists('users');
  }
}
```

::: warning MongoDB Note
Since MongoDB is schema-less, migrations are often used for data transformation or creating indexes, rather than defining rigid table structures. However, `Schema.create` is still useful for setting up initial validation rules or indexes if the driver supports it.
:::

## Running Migrations

To run all of your outstanding migrations, execute the `migrate` command:

```bash
bun pulse migrate
```

## Rolling Back Migrations

To rollback the latest migration operation:

```bash
bun pulse migrate:rollback
```

To reset the database (rollback all migrations):

```bash
bun pulse migrate:reset
```

To refresh the database (rollback all and re-run, useful for development):

```bash
bun pulse migrate:refresh
```
