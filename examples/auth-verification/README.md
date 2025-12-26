# Auth & Security Verification

This example validates the Gravito Security Suite (`fortify`, `sentinel`, `pulsar`, `plasma`) in an RBAC scenario.

## Scenario
**Multi-tenant RBAC System**
- User Registration via `fortify`.
- Session persistence via `pulsar` (Memory driver).
- Authentication middleware and Role-based Access Control (RBAC) via `sentinel` Gates.
- Accessing `/user` requires standard authentication.
- Accessing `/admin` requires `admin` role (verified via Gate).

## Running
```bash
bun run verify.ts
```

## Highlights
- **Integration**: Demonstrates how `fortify` controllers interact with `sentinel` guards.
- **Middleware**: Uses `auth()` and `can()` middleware for declarative protection.
- **Persistence**: Validates that session cookies are correctly set and parsed across requests.
- **Mocking**: Includes a mock `User` model and `Atlas DB` bypass for zero-dependency local verification.
