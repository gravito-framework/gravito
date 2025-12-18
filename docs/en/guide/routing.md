---
title: Routing
---

# Routing

Gravito's routing system is built on top of [Hono](https://hono.dev/), providing a familiar, expressive, and fluent API similar to Laravel.

## Basic Routing

The most basic route accepts a URI and a closure:

```typescript
import { PlanetCore } from 'gravito-core';

// ... core initialization

core.router.get('/hello', (c) => {
  return c.text('Hello World');
});

core.router.post('/users', (c) => {
  // Handle POST request
});
```

## Controller Routing

You can route requests to controller classes. Controllers are instantiated via the Service Container.

```typescript
import { UserController } from './controllers/UserController';

// Route to [ControllerClass, 'methodName']
core.router.get('/users', [UserController, 'index']);
core.router.post('/users', [UserController, 'store']);
```

## Named Routes

Named routes allow you to generate URLs for specific routes easily. You can chain the `name` method to any route definition:

```typescript
core.router.get('/users/:id', [UserController, 'show']).name('users.show');
```

### Generating URLs

Once a route is named, you can generate URLs using the `url` method:

```typescript
const url = core.router.url('users.show', { id: 1 });
// Result: /users/1

// With query parameters
const url = core.router.url('users.show', { id: 1 }, { sort: 'desc' });
// Result: /users/1?sort=desc
```

## Resource Routes

Gravito supports Laravel-style resource routing:

```ts
core.router.resource('users', UserController)
```

This registers the standard actions:

| Action | Method | Path | Default Name |
|--------|--------|------|--------------|
| index | GET | `/users` | `users.index` |
| create | GET | `/users/create` | `users.create` |
| store | POST | `/users` | `users.store` |
| show | GET | `/users/:id` | `users.show` |
| edit | GET | `/users/:id/edit` | `users.edit` |
| update | PUT/PATCH | `/users/:id` | `users.update` |
| destroy | DELETE | `/users/:id` | `users.destroy` |

Use `only` / `except` to narrow actions:

```ts
core.router.resource('users', UserController, { only: ['index', 'show'] })
```

## Route Model Binding

Bind a route parameter to an async resolver:

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

If a binding cannot resolve, Gravito throws `ModelNotFoundException` and returns a 404 response.

## Route Cache (Named Routes)

Gravito can cache the **named route manifest** for faster URL generation in CLIs and tools:

```bash
gravito route:cache --entry src/index.ts
gravito route:clear
```

> **Note**: This caches named routes for URL generation and introspection. HTTP request matching still comes from Hono route registrations.

## Route Groups

Route groups allow you to share route attributes, such as middleware, prefixes, or domain constraints, across a large number of routes.

### Middleware

```typescript
import { authMiddleware } from './middleware/auth';

core.router.middleware(authMiddleware).group((router) => {
  router.get('/dashboard', [DashboardController, 'index']);
  router.get('/profile', [ProfileController, 'edit']);
});
```

### Route Prefixes

```typescript
core.router.prefix('/api').group((router) => {
  router.get('/users', [UserController, 'index']);
  // Matches: /api/users
});
```

### Sub-Domain Routing

```typescript
core.router.domain('api.myapp.com').group((router) => {
  router.get('/users', [UserController, 'index']);
});
```

## FormRequest Validation

Gravito supports Laravel-like FormRequest validation directly in the route definition.

```typescript
import { StoreUserRequest } from './requests/StoreUserRequest';

core.router.post('/users', StoreUserRequest, [UserController, 'store']);
```

If validation fails, the request is automatically stopped, and a 422 error is returned (or 403 for authorization failures).

## Rate Limiting

Gravito includes a middleware to rate limit access to routes.

```typescript
import { ThrottleRequests } from 'gravito-core';

const throttle = new ThrottleRequests(core);

core.router.middleware(throttle.handle(60, 60)).group((router) => {
  router.get('/api/resource', [ApiController, 'index']);
});
```

This example limits access to 60 requests per minute per IP address.
