# Orbit Request

> Gravito 的表單請求驗證模組，支援 Zod 與 Valibot。

## 安裝

```bash
bun add @gravito/impulse
```

## 快速開始

```typescript
import { FormRequest, z } from '@gravito/impulse'

export class StoreUserRequest extends FormRequest {
  schema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Invalid email format'),
    age: z.number().min(18).optional(),
  })
}
```

```typescript
core.router.post('/users', StoreUserRequest, [UserController, 'store'])
```
