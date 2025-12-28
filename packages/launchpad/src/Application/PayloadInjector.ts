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
    // 假設專案根目錄有 package.json
    const installRes = await this.docker.executeCommand(containerId, [
      'bun',
      'install',
      '--cwd',
      '/app',
    ])
    if (installRes.exitCode !== 0) {
      throw new Error(`安裝依賴失敗: ${installRes.stderr}`)
    }

    console.log(`[PayloadInjector] 點火！`)
    // 真正啟動應用程式 (非同步執行，不等待結束)
    this.docker.executeCommand(containerId, ['bun', 'run', '/app/examples/demo.ts']).catch((e) => {
      console.error(`[PayloadInjector] 運行異常:`, e)
    })

    rocket.ignite()
  }
}
