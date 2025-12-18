# @gravito/orbit-auth

> The Authentication and Authorization Orbit for Galaxy Architecture.

Provides a comprehensive, Laravel-like authentication system with support for multiple guards, user providers, and authorization gates.

## 📦 Installation

```bash
bun add @gravito/orbit-auth
```

## 🚀 Usage

### basic Configuration

```typescript
import { PlanetCore } from 'gravito-core'
import { OrbitAuth, type AuthConfig } from '@gravito/orbit-auth'

const core = new PlanetCore()

// Configure Authentication
const authConfig: AuthConfig = {
  defaults: {
    guard: 'web',
    passwords: 'users',
  },
  guards: {
    web: {
      driver: 'session',
      provider: 'users',
      sessionKey: 'auth_session'
    },
    api: {
      driver: 'token',
      provider: 'users',
      storageKey: 'api_token',
      inputKey: 'api_token'
    }
  },
  providers: {
    users: {
      driver: 'callback'
    }
  }
}

// Register Orbit
const auth = new OrbitAuth({
  ...authConfig,
  bindings: {
    // Implement user retrieval logic
    providers: {
      users: () => new CallbackUserProvider(
        async (id) => db.users.find(id),
        async (user, creds) => Hash.verify(creds.password, user.password),
        async (identifier, token) => null, // Remember me
        async (creds) => db.users.findByApiToken(creds.api_token) // API Token
      )
    }
  }
})

auth.install(core)
```

### Middleware

Protect your routes using the built-in middleware.

```typescript
import { auth, guest, can } from '@gravito/orbit-auth'

// Protect routes (requires authentication)
app.get('/dashboard', auth(), (c) => c.text('Dashboard'))

// Guest only (redirects if authenticated)
app.get('/login', guest(), (c) => c.text('Login'))

// Authorization checks
app.get('/admin', auth(), can('manage-users'), (c) => c.text('Admin Panel'))
```

### Gates & Policies

Define authorization logic using Gates.

```typescript
// Define logic
const gate = c.get('gate')

// Simple closure ability
gate.define('edit-post', (user, post) => {
  return user.id === post.user_id
})

// Check ability
if (await gate.allows('edit-post', post)) {
  // ...
}
```

### Guards

Access the auth manager to handle authentication state.

```typescript
const auth = c.get('auth')

// Get current user
const user = await auth.user()

// Check if authenticated
if (await auth.check()) {
  // ...
}

// Login (Session guard)
await auth.login(user)

// Logout
await auth.logout()
```
