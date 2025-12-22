# Gravito HTTP Abstraction - Migration Guide

> A step-by-step guide to migrating from Hono types to Gravito abstractions.

## Overview

Gravito 2.0 introduces an HTTP abstraction layer that decouples your code from the underlying HTTP engine. This enables future migration to a custom Bun-native implementation for maximum performance.

## Quick Reference

| Before (Hono) | After (Gravito) |
|---------------|-----------------|
| `import type { Context } from 'hono'` | `import type { GravitoContext } from 'gravito-core'` |
| `import type { Handler } from 'hono'` | `import type { GravitoHandler } from 'gravito-core'` |
| `import type { MiddlewareHandler } from 'hono'` | `import type { GravitoMiddleware } from 'gravito-core'` |
| `import type { Next } from 'hono'` | `import type { GravitoNext } from 'gravito-core'` |
| `c.req.param('id')` | `ctx.req.param('id')` (same API!) |
| `c.json({ data })` | `ctx.json({ data })` (same API!) |

## Migration Steps

### Step 1: Update Imports

```typescript
// Before
import type { Context, MiddlewareHandler } from 'hono'

// After
import type { GravitoContext, GravitoMiddleware } from 'gravito-core'
```

### Step 2: Update Controller Types

```typescript
// Before
import type { Context } from 'hono'

export class UserController {
  async index(c: Context) {
    return c.json({ users: await User.all() })
  }
}

// After
import type { GravitoContext } from 'gravito-core'

export class UserController {
  async index(ctx: GravitoContext) {
    return ctx.json({ users: await User.all() })
  }
}
```

### Step 3: Update Middleware Types

```typescript
// Before
import type { MiddlewareHandler, Next } from 'hono'

const logger: MiddlewareHandler = async (c, next) => {
  console.log(`${c.req.method} ${c.req.path}`)
  await next()
}

// After
import type { GravitoMiddleware, GravitoNext } from 'gravito-core'

const logger: GravitoMiddleware = async (ctx, next) => {
  console.log(`${ctx.req.method} ${ctx.req.path}`)
  await next()
}
```

## Compatibility Mode

For gradual migration, use the compatibility layer:

```typescript
// During migration, you can use Hono-style aliases:
import type { Context, MiddlewareHandler, Next } from 'gravito-core/compat'

// Your existing code works unchanged!
export async function myMiddleware(c: Context, next: Next) {
  await next()
}
```

## Native Access (Escape Hatch)

When you need Hono-specific features not yet abstracted:

```typescript
import type { GravitoContext } from 'gravito-core'
import type { Context as HonoContext } from 'hono'

async function advancedHandler(ctx: GravitoContext) {
  // Access the underlying Hono context
  const honoCtx = ctx.native as HonoContext
  
  // Use Hono-specific features
  honoCtx.executionCtx.waitUntil(...)
  
  return ctx.json({ ok: true })
}
```

## API Compatibility

The `GravitoContext` API is designed to match Hono's `Context`:

| Method | Compatibility |
|--------|---------------|
| `ctx.req.param(name)` | ✅ Identical |
| `ctx.req.query(name)` | ✅ Identical |
| `ctx.req.header(name)` | ✅ Identical |
| `ctx.req.json()` | ✅ Identical |
| `ctx.req.text()` | ✅ Identical |
| `ctx.req.formData()` | ✅ Identical |
| `ctx.json(data, status?)` | ✅ Identical |
| `ctx.text(text, status?)` | ✅ Identical |
| `ctx.html(html, status?)` | ✅ Identical |
| `ctx.redirect(url, status?)` | ✅ Identical |
| `ctx.header(name, value)` | ✅ Identical |
| `ctx.get(key)` | ✅ Identical |
| `ctx.set(key, value)` | ✅ Identical |

## Extending Variables

To add custom context variables in your Orbit:

```typescript
// In your orbit module
declare module 'gravito-core' {
  interface GravitoVariables {
    myService: MyService
  }
}

// Now TypeScript knows about ctx.get('myService')
```

## Benefits of Migration

1. **Future-proof**: Your code will work with any HTTP adapter
2. **Type Safety**: Full TypeScript support
3. **Performance**: Ready for Bun-native optimizations
4. **Consistency**: Unified API across the framework

## FAQ

### Q: Will my existing code break?
A: No! The migration is optional and backward compatible.

### Q: When will Hono support be deprecated?
A: No plans to deprecate. You can continue using Hono types.

### Q: How do I use Hono middleware?
A: Hono middleware continues to work via `core.app.use()`.

---

For questions, open an issue on [GitHub](https://github.com/gravito-framework/gravito).
