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
 * Gravito Launchpad Orbit
 */
export class LaunchpadOrbit implements GravitoOrbit {
  async install(core: PlanetCore): Promise<void> {
    const logger = core.logger

    // 1. Initialize Infrastructure
    const docker = new DockerAdapter()
    const git = new ShellGitAdapter()
    const router = new BunProxyAdapter()
    const github = new OctokitGitHubAdapter(process.env.GITHUB_TOKEN)

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

    // 3. Register Routes (Webhook Endpoint)
    core.router.post('/launch', async (c) => {
      const rawBody = await c.req.text()
      const signature = c.req.header('x-hub-signature-256') || ''
      const secret = process.env.GITHUB_WEBHOOK_SECRET

      // 選擇性驗證簽名
      if (secret && !github.verifySignature(rawBody, signature, secret)) {
        logger.error('[GitHub] Webhook signature verification failed')
        return c.json({ error: 'Invalid signature' }, { status: 401 })
      }

      const body = JSON.parse(rawBody)
      const event = c.req.header('x-github-event')

      // 只處理 Pull Request 事件
      if (event === 'pull_request') {
        const action = body.action
        const pr = body.pull_request
        const missionId = `pr-${pr.number}`

        // 🚀 發射或更新：當 PR 開啟、有新 commit 或重新開啟時
        if (['opened', 'synchronize', 'reopened'].includes(action)) {
          const mission = Mission.create({
            id: missionId,
            repoUrl: pr.base.repo.clone_url,
            branch: pr.head.ref,
            commitSha: pr.head.sha,
          })

          const rocketId = await ctrl.launch(mission, (type, data) => {
            // @ts-expect-error Ripple injection
            core.ripple.publish('telemetry', { type, data })
          })

          // 自動貼回 GitHub 留言 (僅在第一次或重要更新時)
          if (action === 'opened' || action === 'reopened') {
            const previewUrl = `http://${missionId}.dev.local:8080`
            const dashboardUrl = `http://${c.req.header('host')?.split(':')[0]}:5173`

            const comment =
              `🚀 **Gravito Launchpad: Deployment Ready!**\n\n` +
              `- **Preview URL**: [${previewUrl}](${previewUrl})\n` +
              `- **Mission Dashboard**: [${dashboardUrl}](${dashboardUrl})\n\n` +
              `*Rocket ID: ${rocketId} | Commit: ${pr.head.sha.slice(0, 7)}*`

            await github.postComment(
              pr.base.repo.owner.login,
              pr.base.repo.name,
              pr.number,
              comment
            )
          }

          return c.json({ success: true, missionId, rocketId })
        }

        // ♻️ 回收：當 PR 關閉時
        if (action === 'closed') {
          await pool.recycle(missionId)
          return c.json({ success: true, action: 'recycled' })
        }
      }

      // 非 PR 事件或未處理動作
      return c.json({ success: true, message: 'Event ignored' })
    })

    // 手動強制回收接口
    core.router.post('/recycle', async (c) => {
      const body = (await c.req.json()) as any
      if (!body.missionId) {
        return c.json({ error: 'missionId required' }, { status: 400 })
      }

      await pool.recycle(body.missionId)
      return c.json({ success: true })
    })

    logger.info('[Launchpad] GitHub Bot orbit installed.')
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
      CACHE_DRIVER: 'file',
    },
    orbits: [new OrbitCache(), new OrbitRipple(), new LaunchpadOrbit()],
  })

  return core.liftoff()
}
