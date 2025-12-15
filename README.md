# gravito-core

> The Micro-kernel for Galaxy Architecture. Lightweight, extensible, and built on Hono & Bun.

[![npm version](https://img.shields.io/npm/v/gravito-core.svg)](https://www.npmjs.com/package/gravito-core)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.0+-black.svg)](https://bun.sh/)

**gravito-core** is the foundation for building modular backend applications using the **Galaxy Architecture**. It provides a robust Hook system (Filters & Actions) and an Orbit mounting mechanism, allowing you to build loosely coupled, highly extensible systems.

## ✨ Features

- 🪐 **PlanetCore** - A centralized Hono-based kernel to manage your application lifecycle.
- 🪝 **Hook System** - WordPress-style async **Filters** and **Actions** for powerful extensibility.
- 🛰️ **Orbit Mounting** - Easily mount external Hono applications (Orbits) to specific paths.
- 🚀 **Modern** - Built for **Bun** runtime with native TypeScript support.
- 🪶 **Lightweight** - Zero external dependencies (except `hono`).

## 📦 Installation

```bash
bun add gravito-core
```

## 🚀 Quick Start

### 1. Initialize the Core

```typescript
import { PlanetCore } from 'gravito-core';

const core = new PlanetCore();
```

### 2. Register Hooks

Use **Filters** to modify data:

```typescript
core.hooks.addFilter('modify_content', async (content: string) => {
  return content.toUpperCase();
});

const result = await core.hooks.applyFilters('modify_content', 'hello galaxy');
// result: "HELLO GALAXY"
```

Use **Actions** to trigger side-effects:

```typescript
core.hooks.addAction('user_registered', async (userId: string) => {
  console.log(`Sending welcome email to ${userId}`);
});

await core.hooks.doAction('user_registered', 'user_123');
```

### 3. Mount an Orbit

Orbits are just standard Hono applications that plug into the core.

```typescript
import { Hono } from 'hono';

const blogOrbit = new Hono();
blogOrbit.get('/posts', (c) => c.json({ posts: [] }));

// Mount the orbit to /api/blog
core.mountOrbit('/api/blog', blogOrbit);
```

### 4. Liftoff! 🚀

```typescript
// Export for Bun.serve
export default core.liftoff(3000);
```

## 📖 API Reference

### `PlanetCore`

- **`constructor()`**: Initialize the core.
- **`mountOrbit(path: string, app: Hono)`**: Mount a Hono app to a sub-path.
- **`liftoff(port?: number)`**: Returns the configuration object for `Bun.serve`.
- **`app`**: Access the internal Hono instance.
- **`hooks`**: Access the HookManager.

### `HookManager`

- **`addFilter(hook, callback)`**: Register a filter.
- **`applyFilters(hook, initialValue, ...args)`**: Execute filters sequentially.
- **`addAction(hook, callback)`**: Register an action.
- **`doAction(hook, ...args)`**: Execute actions.

## 🤝 Contributing

Contributions, issues and feature requests are welcome!
Feel free to check the [issues page](https://github.com/CarlLee1983/gravito-core/issues).

## 📝 License

MIT © [Carl Lee](https://github.com/CarlLee1983)
