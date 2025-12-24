import { existsSync, rmSync } from 'node:fs'
import { build } from 'bun'

// Clean dist
if (existsSync('./dist')) {
  rmSync('./dist', { recursive: true })
}

// ─────────────────────────────────────────────────────────────
// Build ESM for Bun (full features including BunSQLiteStorage)
// ─────────────────────────────────────────────────────────────
await build({
  entrypoints: ['./src/index.ts', './src/bun.ts'],
  outdir: './dist',
  target: 'bun',
  format: 'esm',
  external: ['gravito-core'],
  splitting: true,
  naming: '[dir]/[name].js',
})

// ─────────────────────────────────────────────────────────────
// Build ESM for Node (without Bun-specific imports)
// ─────────────────────────────────────────────────────────────
await build({
  entrypoints: ['./src/index.node.ts'],
  outdir: './dist/node',
  target: 'node',
  format: 'esm',
  external: ['gravito-core'],
  splitting: false,
  naming: 'index.mjs',
})

// ─────────────────────────────────────────────────────────────
// Build CJS for Node (legacy CommonJS support) using tsup
// ─────────────────────────────────────────────────────────────
const tsupCjs = Bun.spawn(
  [
    'npx',
    'tsup',
    'src/index.node.ts',
    '--format',
    'cjs',
    '--external',
    'gravito-core',
    '--outDir',
    'dist/node',
    '--no-dts', // types already generated
    '--clean',
    'false'
  ],
  {
    stdout: 'inherit',
    stderr: 'inherit',
  }
)
const tsupCjsCode = await tsupCjs.exited
if (tsupCjsCode !== 0) {
  console.error('❌ tsup CJS build failed')
  process.exit(1)
}

// ─────────────────────────────────────────────────────────────
// Generate type declarations
// ─────────────────────────────────────────────────────────────
const tsc = Bun.spawn(
  [
    'npx',
    'tsc',
    '--emitDeclarationOnly',
    '--declaration',
    '--declarationMap',
    '--declarationDir',
    './dist',
  ],
  {
    cwd: import.meta.dir,
    stdout: 'inherit',
    stderr: 'inherit',
  }
)

await tsc.exited

console.log('✅ @gravito/flux built successfully')
console.log('   📦 dist/index.js       (Bun ESM - full features)')
console.log('   📦 dist/bun.js         (Bun-specific exports)')
console.log('   📦 dist/node/index.mjs (Node ESM)')
console.log('   📦 dist/node/index.cjs (Node CJS)')
console.log('   📦 dist/*.d.ts         (Type declarations)')
