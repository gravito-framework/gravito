import { bootstrapLaunchpad } from './src/index'

const config = await bootstrapLaunchpad()
Bun.serve(config)

console.log(`🚀 Launchpad Command Center active at: http://localhost:${config.port}`)
console.log(`📡 Telemetry WebSocket channel: ws://localhost:${config.port}/ws`)
