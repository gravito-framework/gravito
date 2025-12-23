import { build } from 'bun'

await build({
    entrypoints: ['./src/index.ts'],
    outdir: './dist',
    target: 'bun',
    format: 'esm',
    external: ['gravito-core'],
    splitting: false,
})

// Generate types
const tsc = Bun.spawn(['bunx', 'tsc', '--emitDeclarationOnly'], {
    cwd: import.meta.dir,
    stdout: 'inherit',
    stderr: 'inherit',
})

await tsc.exited

console.log('✅ @gravito/flux built successfully')
