#!/usr/bin/env node
const { spawnSync } = require('child_process')

const result = spawnSync('bun', ['run', 'changeset', 'publish'], {
  stdio: 'inherit',
})

if (result.status === 0) {
  process.exit(0)
}

const output = `${result.stdout ?? ''}${result.stderr ?? ''}`
const isRegistryError =
  /E404 Not Found/.test(output) ||
  /Access token expired/.test(output) ||
  /not in this registry/i.test(output)

if (isRegistryError) {
  console.warn(
    'Skipping publish because npm registry rejected the request (token missing/expired).'
  )
  process.exit(0)
}

process.exit(result.status ?? 1)
