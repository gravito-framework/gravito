import { OrbitRipple } from '@gravito/ripple'
import { OrbitCache } from '@gravito/stasis'
import { type GravitoOrbit, PlanetCore, ServiceProvider, type Container } from 'gravito-core'
import { MissionControl } from './Application/MissionControl'
import { PayloadInjector } from './Application/PayloadInjector'
import { PoolManager } from './Application/PoolManager'
import { RefurbishUnit } from './Application/RefurbishUnit'
import { Mission } from './Domain/Mission'
import { DockerAdapter } from './Infrastructure/Docker/DockerAdapter'
import { ShellGitAdapter } from './Infrastructure/Git/ShellGitAdapter'
import { OctokitGitHubAdapter } from './Infrastructure/GitHub/OctokitGitHubAdapter'
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
 * Launchpad 內部的 Service Provider
 */
class LaunchpadServiceProvider extends ServiceProvider {
  register(container: Container): void {
    container.singleton('launchpad.docker', () => new DockerAdapter())
    container.singleton('launchpad.git', () => new ShellGitAdapter())
    container.singleton('launchpad.router', () => new BunProxyAdapter())
    container.singleton('launchpad.github', () => new OctokitGitHubAdapter(process.env.GITHUB_TOKEN))
    
    container.singleton('launchpad.repo', () => {
      const cache = container.make<any>('cache')
      return new CachedRocketRepository(cache)
    })

    container.singleton('launchpad.refurbish', () => {
      return new RefurbishUnit(container.make('launchpad.docker'))
    })

    container.singleton('launchpad.pool', () => {
      return new PoolManager(
        container.make('launchpad.docker'),
        container.make('launchpad.repo'),
        container.make('launchpad.refurbish'),
        container.make('launchpad.router')
      )
    })

    container.singleton('launchpad.injector', () => {
      return new PayloadInjector(
        container.make('launchpad.docker'),
        container.make('launchpad.git')
      )
    })

    container.singleton('launchpad.ctrl', () => {
      return new MissionControl(
        container.make('launchpad.pool'),
        container.make('launchpad.injector'),
        container.make('launchpad.docker'),
        container.make('launchpad.router')
      )
    })
  }

  boot(): void {
    const router = this.core.container.make<BunProxyAdapter>('launchpad.router')
    router.start(8080)
  }
}

/**
 * Gravito Launchpad Orbit
 */
export class LaunchpadOrbit implements GravitoOrbit {
  async install(core: PlanetCore): Promise<void> {
    core.register(new LaunchpadServiceProvider())

    core.router.post('/launch', async (c) => {
      const body = (await c.req.json()) as any
      const mission = Mission.create({
        id: body.id || `pr-${Date.now()}`,
        repoUrl: body.repoUrl,
        branch: body.branch || 'main',
        commitSha: body.commitSha || 'latest',
      })

      const ctrl = core.container.make<MissionControl>('launchpad.ctrl')

      const rocketId = await ctrl.launch(mission, (type, data) => {
        // @ts-expect-error Ripple injection
        core.ripple.publish('telemetry', 'telemetry.data', { type, data })
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
        return c.json({ error: 'missionId required' }, { status: 400 })
      }

      const pool = core.container.make<PoolManager>('launchpad.pool')
      await pool.recycle(body.missionId)
      return c.json({ success: true })
    })
  }
}

/**
 * 一鍵啟動 Launchpad 應用程式
 */
export async function bootstrapLaunchpad() {
  const ripple = new OrbitRipple({ path: '/ws' })
  
  const core = await PlanetCore.boot({
    config: {
      APP_NAME: 'Gravito Launchpad',
      PORT: 4000,
      CACHE_DRIVER: 'file',
    },
    orbits: [
      new OrbitCache(),
      ripple,
      new LaunchpadOrbit()
    ]
  })

  await core.bootstrap()

  const liftoffConfig = core.liftoff()

  // 封裝成完整的 Bun.serve 配置
  return {
    port: liftoffConfig.port,
    websocket: ripple.getHandler(),
    fetch: (req: Request, server: any) => {
      // 優先處理 WebSocket 升級
      if (ripple.getServer().upgrade(req, server)) return
      return liftoffConfig.fetch(req, server)
    }
  }
}
