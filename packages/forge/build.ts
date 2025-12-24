import { spawn } from 'bun'

console.log('Building @gravito/forge...')

// Clean dist
await Bun.$`rm -rf dist`

// Use tsup for multi-format build
const tsup = spawn(
  [
    'npx',
    'tsup',
    'src/index.ts',
    'src/components/index.tsx', // Also bundle React components
    'src/vue/index.ts', // Also bundle Vue components
    '--format',
    'esm,cjs',
    '--dts',
    '--external',
    'gravito-core,hono,react,react-dom,vue',
    '--outDir',
    'dist',
  ],
  {
    stdout: 'inherit',
    stderr: 'inherit',
  }
)

const tsupCode = await tsup.exited
if (tsupCode !== 0) {
  console.error('❌ tsup build failed')
  process.exit(1)
}

// Type declaration generation is now handled by tsup --dts

console.log('✅ Build complete!')
process.exit(0)