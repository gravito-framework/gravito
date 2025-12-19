// @ts-expect-error
const entry = await import(`${process.cwd()}/src/index.ts`)
const core = entry.default?.core || entry.core

if (!core) {
  console.error('Could not find core instance in src/index.ts')
  process.exit(1)
}

// Ensure bootstrapped
// If the entry file doesn't bootstrap, we might need to.
// But usually src/index.ts does core.liftoff() which implies generic usage.
// If we just want the instance, we assume it's initialized but maybe not "started" (listening).
// Accessing services should be fine if registered.

// Expose to global
Object.assign(globalThis, {
  core,
  container: core.container,
  // Helper to resolve things quickly
  resolve: (key: string) => core.container.make(key),
  make: (key: string) => core.container.make(key),
})

console.log('🌌 Gravito Tinker ready.')
console.log('Available globals: core, container, make()')
