# @gravito/spectrum

> **The Gravito Debug Dashboard.**
> Real-time observability, request replay, and deep insights for your local development workflow.

`@gravito/spectrum` is a powerful, zero-config debug dashboard designed specifically for the Gravito ecosystem. It acts as a telescope for your application, capturing HTTP requests, database queries, logs, and exceptions in real-time.

![Spectrum Dashboard](https://via.placeholder.com/1200x600/0f172a/38bdf8?text=Gravito+Spectrum+UI)

## ✨ Features

- **⚡️ Real-time Updates**: Powered by Server-Sent Events (SSE), observe requests as they happen without refreshing.
- **🔍 Deep Inspection**: View detailed request/response headers, bodies, and execution time.
- **🗄️ Database Profiling**: Automatically captures `@gravito/atlas` SQL queries with bindings and duration.
- **↺ Request Replay**: One-click replay of any captured request to quickly reproduce bugs or test fixes.
- **📊 Live Statistics**: Monitor error rates, average latency, and throughput in real-time.
- **💾 Persistence**: Support for File-based storage to keep debug data across server restarts.
- **🛡️ Security Gates**: Configurable authorization logic to secure the dashboard in sensitive environments.

## 📦 Installation

```bash
bun add @gravito/spectrum
```

## 🚀 Quick Start

Simply register the `SpectrumOrbit` in your application entry point:

```typescript
import { PlanetCore } from 'gravito-core'
import { SpectrumOrbit } from '@gravito/spectrum'

const core = new PlanetCore()

// Initialize Spectrum
// Default path: /gravito/spectrum
await core.orbit(new SpectrumOrbit())

await core.liftoff()
```

Visit **http://localhost:3000/gravito/spectrum** to see your dashboard.

## ⚙️ Configuration

You can customize Spectrum by passing a configuration object to the constructor.

```typescript
await core.orbit(new SpectrumOrbit({
  // Change the dashboard path
  path: '/_debug',
  
  // Enable/Disable spectrum (useful for conditional loading)
  enabled: process.env.NODE_ENV !== 'production',
  
  // Storage Strategy (Memory or File)
  storage: new MemoryStorage(), // Default
  
  // Security Gate (Authorization)
  gate: async (c) => {
    // Return true to allow access
    return c.req.ip === '127.0.0.1'
  }
}))
```

### Persistence (File Storage)

By default, Spectrum stores data in memory, which is lost when the server restarts. To persist debug data (e.g., to analyze a crash after restart), use `FileStorage`.

```typescript
import { SpectrumOrbit, FileStorage } from '@gravito/spectrum'
import { join } from 'node:path'

await core.orbit(new SpectrumOrbit({
  storage: new FileStorage({
    directory: join(process.cwd(), 'storage/spectrum')
  })
}))
```

### Security Gates (Production Use)

Spectrum is designed primarily for local development. If you must enable it in a production-like environment, **you must configure a Gate**.

```typescript
await core.orbit(new SpectrumOrbit({
  gate: async (c) => {
    // Example: Only allow if a specific secret header is present
    // or if the user is an admin (via c.get('user'))
    return c.req.header('x-spectrum-secret') === process.env.SPECTRUM_SECRET
  }
}))
```

## 🔌 Integrations

### Database (Atlas)

If `@gravito/atlas` is installed and loaded in your application, Spectrum automatically detects it and begins capturing all database queries. No extra configuration is needed.

### Logs (Logger)

Spectrum automatically wraps the core logger. Any call to `core.logger.info()`, `debug()`, `warn()`, or `error()` is captured and displayed in the dashboard alongside the request context.

## 🛠️ Architecture

Spectrum operates as a **Gravito Orbit**, which allows it to inject itself deeply into the framework lifecycle:

1.  **Middleware**: A global middleware intercepts every HTTP request to measure duration and capture metadata.
2.  **Hooks**: It attaches to Atlas query listeners to profile database performance.
3.  **Storage Driver**: Data is piped into a storage driver (Memory/File).
4.  **Event Bus**: New events are broadcasted via SSE to the connected UI clients.

## ❓ Spectrum vs Monitor

| Feature | `@gravito/spectrum` | `@gravito/monitor` |
|---------|---------------------|--------------------|
| **Goal** | Development Debugging | Production Observability |
| **Interface** | Built-in UI Dashboard | JSON / Prometheus / OTLP |
| **Data Retention** | Short-term (Recent 100) | Long-term (TSDB) |
| **Usage** | Inspecting payload/SQL | Health checks & Metrics |
| **Best For** | Developers fixing bugs | DevOps monitoring uptime |

## License

MIT
