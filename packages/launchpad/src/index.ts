import { OrbitRipple } from '@gravito/ripple'
import { OrbitCache } from '@gravito/stasis'
import { type GravitoOrbit, PlanetCore } from 'gravito-core'
import { MissionControl } from './Application/MissionControl'
import { PayloadInjector } from './Application/PayloadInjector'
import { PoolManager } from './Application/PoolManager'
import { RefurbishUnit } from './Application/RefurbishUnit'
import { Mission } from './Domain/Mission'
import { DockerAdapter } from './Infrastructure/Docker/DockerAdapter'
import { ShellGitAdapter } from './Infrastructure/Git/ShellGitAdapter'
import { CachedRocketRepository } from './Infrastructure/Persistence/CachedRocketRepository'
import { BunProxyAdapter } from './Infrastructure/Router/BunProxyAdapter'

export * from './Application/MissionControl'
export * from './Application/PayloadInjector'
export * from './Application/PoolManager'
export * from './Application/RefurbishUnit'
export * from './Domain/Mission'
export * from './Domain/Rocket'
export * from './Domain/RocketStatus'

/**
 * Gravito Launchpad Orbit
 */
export class LaunchpadOrbit implements GravitoOrbit {
  async install(core: PlanetCore): Promise<void> {
    const logger = core.logger

    // 1. Initialize Infrastructure
    const docker = new DockerAdapter()
    const git = new ShellGitAdapter()
    const router = new BunProxyAdapter()

    // 取得 Cache Service (由 OrbitCache 注入)
    const cache = core.container.make<any>('cache')
    const repo = new CachedRocketRepository(cache)
    const refurbish = new RefurbishUnit(docker)

    // 2. Initialize Application Services
    const pool = new PoolManager(docker, repo, refurbish, router)
    const injector = new PayloadInjector(docker, git)
    const ctrl = new MissionControl(pool, injector, docker, router)

    // 啟動反向代理伺服器 (預設 8080)
    router.start(8080)

    // 3. Register Routes
    core.router.post('/launch', async (c) => {
      const body = (await c.req.json()) as any
      const mission = Mission.create({
        id: body.id || `pr-${Date.now()}`,
        repoUrl: body.repoUrl,
        branch: body.branch || 'main',
        commitSha: body.commitSha || 'latest',
      })

      const rocketId = await ctrl.launch(mission, (type, data) => {
        // 使用 Ripple 進行廣播
        // @ts-expect-error Ripple injection
        core.ripple.publish('telemetry', { type, data })
      })

      return c.json({
        success: true,
        rocketId,
        previewUrl: `http://${mission.id}.dev.local:8080`,
      })
    })

    core.router.post('/recycle', async (c) => {
      const body = (await c.req.json()) as any
      if (!body.missionId) {
        return c.json({ error: 'missionId required' }, 400)
      }

      await pool.recycle(body.missionId)
      return c.json({ success: true })
    })

    logger.info('[Launchpad] Mission Control orbit installed.')
  }
}

/**
 * 一鍵啟動 Launchpad 應用程式
 */
export async function bootstrapLaunchpad() {
  const core = await PlanetCore.boot({
    config: {
      APP_NAME: 'Gravito Launchpad',
      PORT: 4000,
      // Cache 設定：使用檔案儲存以達到持久化
      CACHE_DRIVER: 'file',
    },
    orbits: [new OrbitCache(), new OrbitRipple(), new LaunchpadOrbit()],
  })

  return core.liftoff()
}
