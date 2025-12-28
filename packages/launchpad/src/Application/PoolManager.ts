import type { IDockerAdapter, IRocketRepository } from '../Domain/Interfaces'
import type { Mission } from '../Domain/Mission'
import { Rocket } from '../Domain/Rocket'

export class PoolManager {
  constructor(
    private dockerAdapter: IDockerAdapter,
    private rocketRepository: IRocketRepository
  ) {}

  /**
   * 初始化發射場：預先準備指定數量的火箭
   */
  async warmup(count: number): Promise<void> {
    const currentRockets = await this.rocketRepository.findAll()
    const needed = count - currentRockets.length

    if (needed <= 0) {
      return
    }

    console.log(`[LaunchPad] 正在熱機，準備發射 ${needed} 架新火箭...`)

    for (let i = 0; i < needed; i++) {
      const containerId = await this.dockerAdapter.createBaseContainer()
      const rocketId = `rocket-${Math.random().toString(36).substring(2, 9)}`
      const rocket = new Rocket(rocketId, containerId)
      await this.rocketRepository.save(rocket)
    }
  }

  /**
   * 獲取一架可用的火箭並分配任務
   */
  async assignMission(mission: Mission): Promise<Rocket> {
    let rocket = await this.rocketRepository.findIdle()

    // 如果池子空了，動態建立一架（實務上應該報警或等待，這裡先簡化為動態建立）
    if (!rocket) {
      console.log(`[LaunchPad] 資源吃緊，正在緊急呼叫後援火箭...`)
      const containerId = await this.dockerAdapter.createBaseContainer()
      rocket = new Rocket(`rocket-dynamic-${Date.now()}`, containerId)
    }

    rocket.assignMission(mission)
    await this.rocketRepository.save(rocket)

    return rocket
  }

  /**
   * 回收指定任務的火箭
   */
  async recycle(missionId: string): Promise<void> {
    const allRockets = await this.rocketRepository.findAll()
    const rocket = allRockets.find((r) => r.currentMission?.id === missionId)

    if (!rocket) {
      console.warn(`[LaunchPad] 找不到屬於任務 ${missionId} 的火箭`)
      return
    }

    rocket.splashDown()
    // 此處應有翻新邏輯 (例如呼叫 dockerAdapter 執行清理)
    // 為了 MVP 簡化，直接完成翻新
    rocket.finishRefurbishment()

    await this.rocketRepository.save(rocket)
    console.log(`[LaunchPad] 火箭 ${rocket.id} 已成功降落並回收。`)
  }
}
