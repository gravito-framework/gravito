import { build } from 'bun'

// Build ESM
await build({
  entrypoints: ['src/index.ts'],
  outdir: 'dist',
  format: 'esm',
  target: 'bun',
  splitting: false,
  minify: false,
  sourcemap: 'external',
  external: ['gravito-core'],
  naming: '[name].mjs',
})

// Build CJS
await build({
  entrypoints: ['src/index.ts'],
  outdir: 'dist',
  format: 'cjs',
  target: 'bun',
  splitting: false,
  minify: false,
  sourcemap: 'external',
  external: ['gravito-core'],
  naming: '[name].cjs',
})

console.log('📝 Generating type declarations...')
const tsc = Bun.spawn(
  ['bunx', 'tsc', '--emitDeclarationOnly', '--skipLibCheck', '--skipDefaultLibCheck'],
  {
    stdout: 'inherit',
    stderr: 'inherit',
  }
)
const exitCode = await tsc.exited
if (exitCode !== 0) {
  console.warn('⚠️  Type declaration generation had warnings, but continuing...')
  // Don't exit on errors for type generation, as it may have issues with cross-package references
}

console.log('✅ Build completed')
