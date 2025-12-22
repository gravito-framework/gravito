# Gravito Galaxy Architecture

Gravito is a micro-kernel framework for building scalable, modular backend systems in TypeScript. 
It leverages the **Galaxy Architecture**—a unique approach inspired by celestial mechanics to manage lifecycle, extensions (Orbits), and lightweight plugins (Satellites).

## 🌟 Key Features

- **Micro-Kernel (PlanetCore)**: A tiny, high-performance core (Self-developed) that only handles lifecycle and hooks.
- **Orbits (Modules)**: Feature-rich extensions (Database, Auth, Storage) that "orbit" the core completely decoupled.
- **Satellites (Plugins)**: Lightweight business logic that hooks into Core or Orbits.
- **Performance**: Optimized for Bun runtime, offering blazing fast startup and request handling.
- **Developer Experience**: Heavy focus on TypeScript, intelligent defaults, and standardization.

## 🚀 Quick Start

### Installation

```bash
bun add gravito-core
```

### Basic Usage

```typescript
import { PlanetCore } from 'gravito-core';

const core = new PlanetCore();

// Add a simple hook
core.hooks.addAction('app:ready', () => {
  console.log('We have liftoff! 🚀');
});

// Start the server
core.liftoff();
```

## 📚 Documentation

Detailed documentation is available in the [docs](./docs) directory.

- [Core Concepts & Usage](./docs/en/guide/core-concepts.md)
- [Plugin Development Guide](./docs/en/guide/plugin-development.md)
- [中文文檔](./README.zh-TW.md)

## 📦 Ecosystem (Orbits)

| Package | Description | Status |
|---|---|---|
| `gravito-core` | The micro-kernel Framework. | ✅ Stable (Alpha) |
| `@gravito/db` | Standard Database Orbit (Drizzle). | ✅ Alpha |
| `@gravito/sentinel` | Standard Authentication Orbit (Auth). | ✅ Alpha |
| `@gravito/nebula` | Standard Storage Orbit (Local/S3). | ✅ Alpha |
| `@gravito/stasis` | Standard Cache Orbit (Memory/Redis). | ✅ Alpha |
| `@gravito/prism` | Standard View Orbit (Template/Image). | ✅ Alpha |
| `@gravito/luminosity` | Standard SEO Orbit (SmartMap). | ✅ Alpha |
| `@gravito/flare` | Standard Notification Orbit. | ✅ Alpha |

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) first.

## 📄 License

MIT © Carl Lee
