import type { IDockerAdapter } from '../Domain/Interfaces'
import type { Mission } from '../Domain/Mission'
import type { PayloadInjector } from './PayloadInjector'
import type { PoolManager } from './PoolManager'

export class MissionControl {
  constructor(
    private poolManager: PoolManager,
    private injector: PayloadInjector,
    private docker: IDockerAdapter
  ) {}

  /**
   * 處理發射流程
   */
  async launch(mission: Mission, onTelemetry: (type: string, data: any) => void): Promise<string> {
    console.log(`[MissionControl] 準備發射任務: ${mission.id}`)

    // 1. 從池子抓火箭
    const rocket = await this.poolManager.assignMission(mission)

    // 2. 注入代碼並點火
    await this.injector.deploy(rocket)

    // 3. 啟動即時遙測
    this.docker.streamLogs(rocket.containerId, (log) => {
      onTelemetry('log', { rocketId: rocket.id, text: log })
    })

    // 定期獲取效能數據
    const statsTimer = setInterval(async () => {
      if (rocket.status === 'DECOMMISSIONED' || rocket.status === 'IDLE') {
        clearInterval(statsTimer)
        return
      }
      const stats = await this.docker.getStats(rocket.containerId)
      onTelemetry('stats', { rocketId: rocket.id, ...stats })
    }, 5000)

    return rocket.id
  }
}
