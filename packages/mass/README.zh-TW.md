# @gravito/mass

> Gravito 的 TypeBox 驗證模組，提供高效能且完整的 TypeScript 支援。

## 安裝

```bash
bun add @gravito/mass
```

## 快速開始

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
