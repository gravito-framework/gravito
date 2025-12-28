import type { IDockerAdapter, IGitAdapter } from '../Domain/Interfaces'
import type { Rocket } from '../Domain/Rocket'

export class PayloadInjector {
  constructor(
    private docker: IDockerAdapter,
    private git: IGitAdapter
  ) {}

  /**
   * 執行載荷注入：Clone -> Inject -> Install -> Ignite
   */
  async deploy(rocket: Rocket): Promise<void> {
    if (!rocket.currentMission) {
      throw new Error(`Rocket ${rocket.id} 沒有指派任務，無法部署`)
    }

    const { repoUrl, branch } = rocket.currentMission
    const containerId = rocket.containerId

    console.log(`[PayloadInjector] 正在拉取代碼: ${repoUrl} (${branch})`)
    const codePath = await this.git.clone(repoUrl, branch)

    console.log(`[PayloadInjector] 正在注入載荷至容器: ${containerId}`)
    await this.docker.copyFiles(containerId, codePath, '/app')

    console.log(`[PayloadInjector] 正在安裝依賴...`)

    // 寫入一個強制覆蓋的 bunfig.toml
    const bunfigContent = `[install]\nfrozenLockfile = false\n`
    await this.docker.executeCommand(containerId, [
      'sh',
      '-c',
      `echo "${bunfigContent}" > /app/bunfig.toml`,
    ])

    // 刪除舊的 lockfile
    await this.docker.executeCommand(containerId, ['rm', '-f', '/app/bun.lockb'])

    // 安裝 (跳過腳本以避免編譯原生模組失敗)
    const _installRes = await this.docker.executeCommand(containerId, [
      'bun',
      'install',
      '--cwd',
      '/app',
      '--no-save',
      '--ignore-scripts',
    ])

    // Debug: Check file content
    const fileContent = await this.docker.executeCommand(containerId, [
      'cat',
      '/app/examples/demo.ts',
    ])
    console.log('[Debug] demo.ts snippet:', fileContent.stdout.split('\n').slice(35, 40).join('\n'))

    console.log(`[PayloadInjector] 點火！`)
    // 真正啟動應用程式 (非同步執行，不等待結束)
    this.docker.executeCommand(containerId, ['bun', 'run', '/app/examples/demo.ts']).catch((e) => {
      console.error(`[PayloadInjector] 運行異常:`, e)
    })

    rocket.ignite()
  }
}
