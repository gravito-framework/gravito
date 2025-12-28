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
    // 實際應用中這裡應該使用後台執行 (detached)，或透過 process manager (如 pm2/supervisord)
    // 這裡我們模擬執行 index.ts
    // 注意：這裡不應該 await 直到結束，因為這是 server process
    // 但為了 MVP 測試，我們先假設它會快速回傳或我們只驗證啟動

    // 正確做法：Rocket.ignite() 標記狀態，實際執行可能由另一個監控程序確認
    rocket.ignite()
  }
}
