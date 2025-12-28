import { DockerAdapter } from './src/Infrastructure/Docker/DockerAdapter'
import { createLaunchpadServer } from './src/index'

async function run() {
  console.log('🤖 Starting Auto-Debug Sequence...')

  // 1. Cleanup
  const _docker = new DockerAdapter()
  try {
    const containers = await Bun.spawn([
      'docker',
      'ps',
      '-aq',
      '--filter',
      'label=gravito-origin=launchpad',
    ]).text()
    if (containers.trim()) {
      console.log('🧹 Cleaning up old containers:', containers.replace(/\n/g, ' '))
      await Bun.spawn(['docker', 'rm', '-f', ...containers.trim().split('\n')]).exited
    }
  } catch (_e) {}

  // 2. Start Server
  const server = createLaunchpadServer()
  console.log(`🚀 Server started at ${server.url}`)

  // 3. Launch Mission
  console.log('🔫 Firing Mission...')
  try {
    const res = await fetch(`http://localhost:${server.port}/launch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: `AUTO-DEBUG-${Date.now()}`,
        repoUrl: 'https://github.com/gravito-framework/gravito',
        branch: 'feat/launchpad-dashboard',
      }),
    })

    const data = await res.json()
    console.log('Response:', data)

    if (!data.success) {
      console.error('❌ Launch API failed')
      process.exit(1)
    }

    console.log('✅ Launch command accepted. Waiting for logs...')
    // Keep alive to see logs from server stdout
    await new Promise((r) => setTimeout(r, 60000))
  } catch (e) {
    console.error('❌ Error:', e)
  } finally {
    server.stop()
    process.exit(0)
  }
}

run()
