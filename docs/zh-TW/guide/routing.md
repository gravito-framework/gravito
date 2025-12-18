---
title: 路由 (Routing)
---

# 路由 (Routing)

Gravito 的路由系統建立在 [Hono](https://hono.dev/) 之上，提供了類似 Laravel 的流暢且具表現力的 API。

## 基本路由

最基本的路由接受一個 URI 和一個閉包 (closure)：

```typescript
import { PlanetCore } from 'gravito-core';

// ... core initialization

core.router.get('/hello', (c) => {
  return c.text('Hello World');
});

core.router.post('/users', (c) => {
  // 處理 POST 請求
});
```

## Controller 路由

您可以將請求路由到 Controller 類別。Controller 會透過 Service Container 進行實例化。

```typescript
import { UserController } from './controllers/UserController';

// 路由至 [ControllerClass, 'methodName']
core.router.get('/users', [UserController, 'index']);
core.router.post('/users', [UserController, 'store']);
```

## 命名路由 (Named Routes)

命名路由讓您可以輕鬆地為特定路由產生 URL。您可以在任何路由定義後串接 `name` 方法：

```typescript
core.router.get('/users/:id', [UserController, 'show']).name('users.show');
```

### 產生 URL

一旦路由被命名，您可以使用 `url` 方法來產生 URL：

```typescript
const url = core.router.url('users.show', { id: 1 });
// 結果: /users/1

// 帶有查詢參數 (query parameters)
const url = core.router.url('users.show', { id: 1 }, { sort: 'desc' });
// 結果: /users/1?sort=desc
```

## Resource Routes（資源路由）

Gravito 支援 Laravel 風格的資源路由：

```ts
core.router.resource('users', UserController)
```

這會註冊標準動作：

| 動作 | 方法 | 路徑 | 預設名稱 |
|------|------|------|----------|
| index | GET | `/users` | `users.index` |
| create | GET | `/users/create` | `users.create` |
| store | POST | `/users` | `users.store` |
| show | GET | `/users/:id` | `users.show` |
| edit | GET | `/users/:id/edit` | `users.edit` |
| update | PUT/PATCH | `/users/:id` | `users.update` |
| destroy | DELETE | `/users/:id` | `users.destroy` |

你可以用 `only` / `except` 來限制動作：

```ts
core.router.resource('users', UserController, { only: ['index', 'show'] })
```

## Route Model Binding（路由模型綁定）

將路由參數綁定到非同步解析器：

```ts
core.router.bind('user', async (id) => {
  const user = await UserModel.find(id)
  if (!user) throw new Error('ModelNotFound')
  return user
})

core.router.get('/users/:user', async (c) => {
  const user = c.get('routeModels')?.user
  return c.json({ user })
})
```

若綁定解析失敗，Gravito 會丟出 `ModelNotFoundException` 並回傳 404 回應。

## Route Cache（命名路由快取）

Gravito 可以快取「命名路由清單（manifest）」以加速 CLI 與工具場景的 URL 產生：

```bash
gravito route:cache --entry src/index.ts
gravito route:clear
```

> **Note**: 這裡快取的是命名路由，用於 URL 產生與 introspection；HTTP 請求匹配仍然由 Hono 的路由註冊決定。

## 路由群組 (Route Groups)

路由群組允許您在大量路由之間共用路由屬性，例如 middleware、前綴 (prefixes) 或網域限制。

### Middleware

```typescript
import { authMiddleware } from './middleware/auth';

core.router.middleware(authMiddleware).group((router) => {
  router.get('/dashboard', [DashboardController, 'index']);
  router.get('/profile', [ProfileController, 'edit']);
});
```

### 路由前綴 (Prefixes)

```typescript
core.router.prefix('/api').group((router) => {
  router.get('/users', [UserController, 'index']);
  // 對應路徑: /api/users
});
```

### 子網域路由 (Sub-Domain Routing)

```typescript
core.router.domain('api.myapp.com').group((router) => {
  router.get('/users', [UserController, 'index']);
});
```

## FormRequest 驗證

Gravito 支援在路由定義中直接使用類似 Laravel 的 FormRequest 驗證。

```typescript
import { StoreUserRequest } from './requests/StoreUserRequest';

core.router.post('/users', StoreUserRequest, [UserController, 'store']);
```

如果驗證失敗，請求會自動停止，並回傳 422 錯誤（或授權失敗時回傳 403）。

## 流量限制 (Rate Limiting)

Gravito 內建 middleware 來限制路由的存取頻率。

```typescript
import { ThrottleRequests } from 'gravito-core';

const throttle = new ThrottleRequests(core);

core.router.middleware(throttle.handle(60, 60)).group((router) => {
  router.get('/api/resource', [ApiController, 'index']);
});
```

此範例將存取限制為每個 IP 地址每分鐘 60 次請求。
