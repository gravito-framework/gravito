---
title: Getting Started
order: 2
---

# Getting Started

Ready to experience the speed of Luminosity? This guide will help you set up your first instance and start performing basic operations.

## Installation

Install the core package via Bun:

```bash
bun add @gravito/luminosity
```

## Basic Usage

Initializing a Luminosity instance is straightforward:

```typescript
import { Luminosity } from '@gravito/luminosity';

const db = new Luminosity({
  path: './data',
  maxMemtableSize: 64 * 1024 * 1024, // 64MB
});

await db.open();

// Write some data
await db.put('key1', 'Hello World');

// Read it back
const value = await db.get('key1');
console.log(value); // Hello World

await db.close();
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `path` | `string` | `undefined` | Directory to store data files |
| `maxMemtableSize` | `number` | `67108864` | In-memory buffer size before flushing |
| `bloomFilter` | `boolean` | `true` | Enable Bloom filters for faster lookups |

## Next Steps

Now that you have Luminosity up and running, explore the [Advanced Configuration](/docs/advanced) and [Performance Tuning](/docs/performance) guides to push your application to its limits.
