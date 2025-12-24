# @gravito/mass

TypeBox-based validation for Gravito. High-performance schema validation with full TypeScript support.

## Features

- **Fast validation**: TypeBox-powered validators with strong runtime performance
- **Full TypeScript support**: Type inference without manual typings
- **Hono integration**: Works seamlessly with Hono validation middleware
- **Multiple sources**: Validate JSON, query, params, and form data

## Installation

```bash
bun add @gravito/mass
```

## Quick Start

### JSON validation

```typescript
import { Hono } from 'hono'
import { Schema, validate } from '@gravito/mass'

const app = new Hono()

app.post('/login',
  validate('json', Schema.Object({
    username: Schema.String(),
    password: Schema.String()
  })),
  (c) => {
    const { username } = c.req.valid('json')
    return c.json({ success: true, message: `Welcome ${username}` })
  }
)
```

### Query validation

```typescript
app.get('/search',
  validate('query', Schema.Object({
    q: Schema.String(),
    page: Schema.Optional(Schema.Number())
  })),
  (c) => {
    const { q, page } = c.req.valid('query')
    return c.json({ query: q, page: page ?? 1 })
  }
)
```

### Route param validation

```typescript
app.get('/users/:id',
  validate('param', Schema.Object({
    id: Schema.String({ pattern: '^[0-9]+$' })
  })),
  (c) => {
    const { id } = c.req.valid('param')
    return c.json({ userId: id })
  }
)
```

## Schema Builder

`Schema` exposes TypeBox constructors:

```typescript
import { Schema } from '@gravito/mass'

Schema.String()
Schema.Number()
Schema.Boolean()
Schema.Array(Schema.String())

Schema.Object({
  name: Schema.String(),
  age: Schema.Number()
})

Schema.Optional(Schema.String())
Schema.String({ default: 'hello' })
Schema.String({ minLength: 2, maxLength: 100 })
Schema.Number({ minimum: 0, maximum: 100 })
Schema.String({ format: 'email' })
```

## Hono Client Integration

When you compose routes with `app.route()`, you get full type inference for the client:

```typescript
// app.ts
import { Hono } from 'hono'
import { userRoute } from './routes/user'

const app = new Hono()
const routes = app.route('/api/users', userRoute)

export default app
export type AppRoutes = typeof routes
```

```typescript
// client.ts
import { hc } from 'hono/client'
import type { AppRoutes } from './types'

export const createClient = (baseUrl: string) => {
  return hc<AppRoutes>(baseUrl)
}

const client = createClient('http://localhost:3000')
const result = await client.api.users.login.$post({
  json: { username: 'user', password: 'pass' }
})
```

## Performance Notes

TypeBox generates validators at build-time for faster runtime performance, smaller bundles, and strong TypeScript inference.

## License

MIT
