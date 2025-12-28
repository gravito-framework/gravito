import { MissionControl } from './Application/MissionControl'
import { PayloadInjector } from './Application/PayloadInjector'
import { PoolManager } from './Application/PoolManager'
import { RefurbishUnit } from './Application/RefurbishUnit'
import { Mission } from './Domain/Mission'
import { DockerAdapter } from './Infrastructure/Docker/DockerAdapter'
import { ShellGitAdapter } from './Infrastructure/Git/ShellGitAdapter'
import { InMemoryRocketRepository } from './Infrastructure/Persistence/InMemoryRocketRepository'

export * from './Application/MissionControl'
export * from './Application/PayloadInjector'
export * from './Application/PoolManager'
export * from './Application/RefurbishUnit'
export * from './Domain/Mission'
export * from './Domain/Rocket'
export * from './Domain/RocketStatus'

/**
 * 簡易發射基地伺服器原型
 */
export function createLaunchpadServer() {
  const docker = new DockerAdapter()
  const repo = new InMemoryRocketRepository()
  const git = new ShellGitAdapter()
  const refurbish = new RefurbishUnit(docker)

  const pool = new PoolManager(docker, repo, refurbish)
  const injector = new PayloadInjector(docker, git)
  const ctrl = new MissionControl(pool, injector, docker)

  return Bun.serve({
    port: 4000,
    async fetch(req, server) {
      // 處理 WebSocket 升級
      if (server.upgrade(req)) {
        return
      }

      const url = new URL(req.url)

      // 1. 發射任務 (模擬 PR Open/Update)
      if (url.pathname === '/launch' && req.method === 'POST') {
        const body = (await req.json()) as any
        const mission = Mission.create({
          id: body.id || `pr-${Date.now()}`,
          repoUrl: body.repoUrl,
          branch: body.branch || 'main',
          commitSha: body.commitSha || 'latest',
        })

        const rocketId = await ctrl.launch(mission, (type, data) => {
          server.publish('telemetry', JSON.stringify({ type, data }))
        })

        return Response.json({ success: true, rocketId })
      }

      // 2. 回收任務 (模擬 PR Closed/Merged)
      if (url.pathname === '/recycle' && req.method === 'POST') {
        const body = (await req.json()) as any
        if (!body.missionId) return Response.json({ error: 'missionId required' }, { status: 400 })

        await pool.recycle(body.missionId)
        return Response.json({ success: true })
      }

      return new Response('Gravito Launchpad Command Center')
    },
    websocket: {
      open(ws) {
        ws.subscribe('telemetry')
        console.log('[WS] 客戶端已連線，已訂閱遙測頻道')
      },
      message(_ws, message) {
        console.log(`[WS] 收到訊息: ${message}`)
      },
    },
  })
}
