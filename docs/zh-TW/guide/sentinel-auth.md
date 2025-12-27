---
title: Sentinel Auth
description: 認證與授權核心（Guards、Providers、Gates）。
---

# Sentinel Auth

Sentinel（`@gravito/sentinel`）是 Gravito 的認證與授權核心，支援多種 guard、provider 與 Gate 授權機制。

## 特色

- 多種 Guard（session / token / jwt）
- 可插拔 User Provider（callback）
- Gate 授權能力（`can` / `authorize`）
- 可與 Fortify UI 搭配

## 安裝

```bash
bun add @gravito/sentinel
```

若使用 Session Guard，請一併安裝：

```bash
bun add @gravito/pulsar
```

## 基本設定

```ts
import { PlanetCore } from 'gravito-core'
import { OrbitSentinel, CallbackUserProvider } from '@gravito/sentinel'
import { OrbitPulsar } from '@gravito/pulsar'

const core = new PlanetCore()

new OrbitPulsar({ driver: 'memory' }).install(core)

new OrbitSentinel({
  defaults: { guard: 'web', passwords: 'users' },
  guards: {
    web: { driver: 'session', provider: 'users', sessionKey: 'auth_session' },
  },
  providers: {
    users: { driver: 'callback' },
  },
  bindings: {
    providers: {
      users: () =>
        new CallbackUserProvider(
          async (id) => null,
          async (_user, _credentials) => false,
          async (_identifier, _token) => null,
          async (_credentials) => null
        ),
    },
  },
}).install(core)
```

## 認證流程

```ts
import { auth } from '@gravito/sentinel'

app.post('/login', async (c) => {
  const authManager = c.get('auth')
  const success = await authManager.attempt({
    email: c.req.query('email'),
    password: c.req.query('password'),
  })
  return success ? c.json({ ok: true }) : c.json({ ok: false }, 401)
})

app.get('/me', auth(), async (c) => {
  const user = await c.get('auth').user()
  return c.json({ user })
})
```

## 授權 Gate

```ts
import { can } from '@gravito/sentinel'

app.get('/admin', can('manage-admin'), async (c) => {
  return c.text('ok')
})
```

## 與 Fortify 搭配

Fortify 提供 UI 與完整認證流程；Sentinel 提供底層守衛與授權邏輯：

- Fortify：UI/路由/表單
- Sentinel：guards / providers / gates

## 下一步

- Fortify 認證 UI：[認證 (Fortify)](./authentication.md)
- 授權能力：[授權 (Authorization)](./authorization.md)
