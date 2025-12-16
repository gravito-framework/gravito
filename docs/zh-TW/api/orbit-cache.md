# @gravito/orbit-cache

> The Standard Cache Orbit for Galaxy Architecture.

Provides a unified caching interface with a built-in Memory (LRU-like) provider, extensible for Redis.

## 📦 Installation

```bash
bun add @gravito/orbit-cache
```

## 🚀 Usage

```typescript
import { PlanetCore } from 'gravito-core';
import orbitCache from '@gravito/orbit-cache';

const core = new PlanetCore();

// Initialize Cache Orbit (Memory)
const cache = orbitCache(core, {
  defaultTTL: 60, // seconds
  exposeAs: 'cache' 
});

// Use in routes
core.app.get('/heavy-data', async (c) => {
  const data = await cache.remember('heavy_key', 300, async () => {
    // Expensive computation...
    return { result: 42 };
  });
  
  return c.json(data);
});
```

## 🪝 Hooks

- `cache:miss` - Fired when data is not found in cache.
- `cache:hit` - Fired when data is retrieved from cache.
