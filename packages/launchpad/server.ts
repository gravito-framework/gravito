import { bootstrapLaunchpad } from './src/index'

const server = await bootstrapLaunchpad()
console.log(`🚀 Launchpad Command Center active at: http://localhost:${server.port}`)
