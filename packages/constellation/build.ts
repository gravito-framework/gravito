import { spawn } from 'bun'

console.log('Building @gravito/constellation...')

// Clean dist
await Bun.$`rm -rf dist`

// Build ESM
await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  target: 'node',
  format: 'esm',
  naming: '[name].mjs',
  external: [
    'gravito-core',
    'hono',
    '@aws-sdk/client-s3',
    '@google-cloud/storage',
    '@gravito/stream',
  ],
})

// Build CJS
await Bun.build({
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
  target: 'node',
  format: 'cjs',
  naming: '[name].cjs',
  external: [
    'gravito-core',
    'hono',
    '@aws-sdk/client-s3',
    '@google-cloud/storage',
    '@gravito/stream',
  ],
})

console.log('📝 Generating type declarations...')
const tsc = spawn(
  [
    'bunx',
    'tsc',
    '--emitDeclarationOnly',
    '--declaration',
    '--declarationMap',
    '--outDir',
    'dist',
    '--skipLibCheck',
  ],
  {
    stdout: 'inherit',
    stderr: 'inherit',
  }
)

const code = await tsc.exited
if (code !== 0) {
  console.warn('⚠️  Type generation had warnings/errors, but continuing...')
}

console.log('✅ Build complete!')
process.exit(0)
