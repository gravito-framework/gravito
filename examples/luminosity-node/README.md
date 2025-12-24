# Luminosity Node Example

This example runs the Gravito sitemap engine in a **Node.js + Express** environment using the official adapter.
It is separate from the Bun benchmark to show that the package works normally on Node runtimes.

## Requirements
- Node.js >= 18

## Install
From the monorepo root:

```bash
bun install
```

(Workspace dependencies are linked by the monorepo.)

## Run

```bash
cd examples/luminosity-node
node src/server.mjs
```

Then open:
- http://localhost:3000/sitemap.xml
- http://localhost:3000/robots.txt

## Notes
- Runtime is **Node.js**, not Bun.
- Uses `@gravito/luminosity-adapter-express` to bridge the HTTP layer.
