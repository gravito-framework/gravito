---
title: Pulse CLI
description: Learn how to use Pulse, Gravito's command-line tool.
---

# Pulse CLI

> `gravito` (or `pulse`) is Gravito's built-in interactive command-line tool, inspired by Laravel Artisan.

## Common Commands

### Project Management

```bash
# Create a new project
gravito create my-app

# List all registered routes
gravito route:list

# Enter interactive REPL
gravito tinker
```

### Code Generation (Make)

```bash
# Create a controller
gravito make:controller UserController

# Create middleware
gravito make:middleware AuthGuard

# Create a job (requires @gravito/stream)
gravito make:job ProcessPayment
```

### System Maintenance

```bash
# Run database migrations (requires @gravito/atlas)
gravito migrate

# Run task scheduling (requires @gravito/horizon)
gravito schedule:run
```

## Custom Commands

You can define your own CLI commands by creating a simple class.

```typescript
import { Command } from '@gravito/pulse'

export default class WelcomeCommand extends Command {
  static signature = 'greet {name}'
  static description = 'Greet a user'

  async handle() {
    const name = this.argument('name')
    this.info(`Hello, ${name}!`)
  }
}
```

Then register this command in your `gravito.config.ts` to make it available.

---

## Next Steps
Check the [Deployment Guide](./deployment.md) to learn how to push your application to the cloud.
