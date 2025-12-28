import { describe, expect, it } from 'bun:test'
import { Mission } from '../src/Domain/Mission'
import { Rocket } from '../src/Domain/Rocket'
import { RocketStatus } from '../src/Domain/RocketStatus'

describe('Rocket Aggregate Root (State Machine)', () => {
  const mission = Mission.create({
    id: 'pr-123',
    repoUrl: 'https://github.com/gravito/app',
    branch: 'main',
    commitSha: 'abc',
  })

  it('應該能正確執行完整的生命週期', () => {
    const rocket = new Rocket('rocket-01', 'docker-id-01')
    expect(rocket.status).toBe(RocketStatus.IDLE)

    // Assign
    rocket.assignMission(mission)
    expect(rocket.status).toBe(RocketStatus.PREPARING)
    expect(rocket.currentMission?.id).toBe('pr-123')

    // Ignite
    rocket.ignite()
    expect(rocket.status).toBe(RocketStatus.ORBITING)

    // Splashdown
    rocket.splashDown()
    expect(rocket.status).toBe(RocketStatus.REFURBISHING)

    // Finish
    rocket.finishRefurbishment()
    expect(rocket.status).toBe(RocketStatus.IDLE)
    expect(rocket.currentMission).toBeNull()
  })

  it('當狀態不正確時應該拋出錯誤', () => {
    const rocket = new Rocket('rocket-02', 'docker-id-02')

    // 直接點火 (錯誤)
    expect(() => rocket.ignite()).toThrow()

    // 指派任務
    rocket.assignMission(mission)

    // 重複指派 (錯誤)
    expect(() => rocket.assignMission(mission)).toThrow()
  })
})
