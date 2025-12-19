#!/usr/bin/env bun
import { spawn } from 'node:child_process'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const require = createRequire(import.meta.url)
const __dirname = dirname(fileURLToPath(import.meta.url))

/**
 * This is a thin wrapper around @gravito/cli to support 'bun create gravito-app'
 */

async function run() {
    const args = process.argv.slice(2)

    // Find the @gravito/cli binary
    // When installed, it should be in the dependencies
    try {
        const cliPath = require.resolve('@gravito/cli/bin/gravito.mjs')

        // Execute the CLI create command
        const child = spawn('bun', [cliPath, 'create', ...args], {
            stdio: 'inherit',
            env: process.env
        })

        child.on('exit', (code) => {
            process.exit(code ?? 0)
        })
    } catch (err) {
        console.error('❌ Failed to locate @gravito/cli. Please try again.')
        process.exit(1)
    }
}

run()
