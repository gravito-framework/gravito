# Orbit Control: Atlas CLI

> **Status:** Command Interface Operational.
> The Atlas CLI is your mission control for database governance, migrations, and scaffolding.

## Usage

Built for the Bun runtime, the Atlas CLI is lightning fast and easy to use.

```bash
bun atlas <command> [flags]
```

## Migration Commands

Manage your database schema evolution with precision.

### `migrate`
Run all pending migrations to catch up to the latest schema version.
```bash
bun atlas migrate
```

### `migrate:rollback`
Undo the last batch of migrations.
```bash
# Rollback one batch (default)
bun atlas migrate:rollback

# Rollback multiple batches
bun atlas migrate:rollback --step 2
```

### `migrate:fresh`
Wipe the entire database and re-run all migrations from scratch.
```bash
bun atlas migrate:fresh
```

### `migrate:status`
View which migrations have been executed and which are still pending.
```bash
bun atlas migrate:status
```

## Scaffolding Commands

Generate the building blocks of your application.

### `make:model <name>`
Create a new ORM Model with a pre-configured structure.
```bash
bun atlas make:model User
```

### `make:migration <name>`
Generate a new timestamped migration file.
```bash
bun atlas make:migration create_users_table
```

## Seeding Commands

Populate your database with data.

### `seed`
Execute all registered seeders to terraform your data environment.
```bash
bun atlas seed
```

## Global Flags

| Flag | Description | Default |
| :--- | :--- | :--- |
| `--path` | Target directory for migrations or models | `database/migrations` |
| `--seed-path` | Target directory for seeders | `database/seeders` |
| `--step` | Number of batches to rollback | `1` |

> "Control is the first principle of gravity."
