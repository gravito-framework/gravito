import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/bun.ts', 'src/index.node.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  splitting: true,
  sourcemap: true,
  clean: true,
  external: ['@gravito/core'],
  target: 'node18', // 確保廣泛兼容性
})
