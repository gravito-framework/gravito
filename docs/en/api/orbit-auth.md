---
title: Orbit Auth
---

# Orbit Auth

> Authentication utilities as a Gravito Orbit.

Package: `@gravito/orbit-auth`

Provides simple JWT utilities and hooks for extending authentication logic.

## Installation

```bash
bun add @gravito/orbit-auth
```

## Usage

```typescript
import { PlanetCore } from 'gravito-core';
import orbitAuth from '@gravito/orbit-auth';

const core = new PlanetCore();

// Initialize Auth Orbit
const auth = orbitAuth(core, {
  secret: 'SUPER_SECRET_KEY',
  exposeAs: 'auth' // Access via c.get('auth')
});

// Use in routes
core.app.post('/login', async (c) => {
  const token = await auth.sign({ sub: '123', role: 'admin' });
  return c.json({ token });
});
```

## Hooks

- `auth:init` - Fired when the Auth orbit initializes.
- `auth:payload` - (Filter) Modify the JWT payload before signing.
