---
title: Gravito CLI
---

# Gravito CLI

The official CLI for scaffolding Gravito projects.

Gravito CLI helps you bootstrap new Gravito projects with a single command. Choose from multiple templates and get started in seconds.

## Installation

```bash
# Global install (recommended)
bun add -g @gravito/cli

# Or use npx
npx @gravito/cli create my-app
```

## Usage

### Create a New Project

```bash
gravito create [project-name]
```

If you don't provide a project name, the CLI will prompt you for one.

### Interactive Mode

Simply run:

```bash
gravito create
```

You'll be guided through:

1. **Project name** – The folder name for your new project.
2. **Template selection** – Choose your starting point.

## Available Templates

| Template | Description |
|----------|-------------|
| `basic` | Minimal setup with PlanetCore + Hono. Great for APIs and simple backends. |
| `inertia-react` | Full-stack monolith with Inertia.js + React + Vite. Build modern SPAs with server-side routing. |

## Example

```bash
$ gravito create my-galaxy-app

 Gravito CLI

✔ What is the name of your new universe? … my-galaxy-app
✔ Pick a starting point: › Basic Planet (Core + Hono)
● Scaffolding your universe...
✔ Universe created!

┌  Mission Successful
│
│  Project: my-galaxy-app
│  Template: basic
│
└

You're all set!

  cd my-galaxy-app
  bun install
  bun run dev
```

## Development

```bash
# Run locally
bun run dev create my-test-app

# Build binary
bun run build
```

## License

MIT © [Carl Lee](https://github.com/CarlLee1983)
