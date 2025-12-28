import { createLaunchpadServer } from './src/index'

const server = createLaunchpadServer()
console.log(`🚀 Launchpad Command Center active at: ${server.url}`)
console.log(`📡 Telemetry WebSocket channel: ws://${server.hostname}:${server.port}`)
