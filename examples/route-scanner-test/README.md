# RouteScanner Test Suite

This example tests the Luminosity RouteScanner cross-framework support.

## Supported Frameworks

- ✅ Hono
- ✅ Express
- ✅ Next.js (File System)
- ✅ Nuxt (File System)

## Running Tests

```bash
cd examples/route-scanner-test
bun install
bun test
```

## Test Structure

```
route-scanner-test/
├── tests/
│   ├── hono-scanner.test.ts      # Hono app route scanning
│   ├── express-scanner.test.ts   # Express app route scanning
│   ├── next-scanner.test.ts      # Next.js file system scanning
│   ├── nuxt-scanner.test.ts      # Nuxt file system scanning
│   └── sitemap-builder.test.ts   # Integration tests
├── fixtures/
│   ├── next-app/                 # Mock Next.js app structure
│   └── nuxt-pages/               # Mock Nuxt pages structure
└── package.json
```
