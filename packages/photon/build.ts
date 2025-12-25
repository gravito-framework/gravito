import { rm } from 'node:fs/promises'
import { build } from 'bun'

// Clean dist
await rm('dist', { recursive: true, force: true })

// Build JS/TS
await build({
  entrypoints: [
    'src/index.ts',
    'src/client.ts',
    'src/logger.ts',
    'src/bun.ts',
    'src/jwt.ts',
    'src/http-exception.ts',
    'src/router/reg-exp-router.ts',
    'src/router/trie-router.ts',
  ],
  outdir: 'dist',
  format: 'esm',
  target: 'node',
  splitting: true,
  minify: false,
  sourcemap: 'external',
})

console.log('📝 Generating type declarations...')
const tsc = Bun.spawn(['bunx', 'tsc', '-p', 'tsconfig.build.json'], {
  stdout: 'inherit',
  stderr: 'inherit',
  cwd: import.meta.dirname,
})

const exitCode = await tsc.exited
if (exitCode !== 0) {
  process.exit(1)
}

console.log('✅ Photon build completed')
