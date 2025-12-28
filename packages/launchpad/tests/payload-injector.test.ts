import { describe, expect, test } from 'bun:test'
import { PayloadInjector } from '../src/Application/PayloadInjector'
import { Mission } from '../src/Domain/Mission'
import { Rocket } from '../src/Domain/Rocket'
import { RocketStatus } from '../src/Domain/RocketStatus'

class FakeGit {
  cloned: Array<{ repoUrl: string; branch: string }> = []
  async clone(repoUrl: string, branch: string): Promise<string> {
    this.cloned.push({ repoUrl, branch })
    return '/tmp/fake-repo'
  }
}

class FakeDocker {
  copyCalls: Array<{ containerId: string; source: string; target: string }> = []
  commands: string[][] = []

  async copyFiles(containerId: string, source: string, target: string): Promise<void> {
    this.copyCalls.push({ containerId, source, target })
  }

  async executeCommand(containerId: string, command: string[]) {
    this.commands.push([containerId, ...command])
    return { stdout: '', stderr: '', exitCode: 0 }
  }
}

describe('PayloadInjector', () => {
  test('throws when rocket has no mission', async () => {
    const docker = new FakeDocker()
    const git = new FakeGit()
    const injector = new PayloadInjector(docker as any, git as any)
    const rocket = new Rocket('rocket-9', 'container-9')

    await expect(injector.deploy(rocket)).rejects.toThrow('沒有指派任務')
  })

  test('deploys payload and ignites rocket', async () => {
    const docker = new FakeDocker()
    const git = new FakeGit()
    const injector = new PayloadInjector(docker as any, git as any)

    const rocket = new Rocket('rocket-10', 'container-10')
    const mission = Mission.create({
      id: 'mission-10',
      repoUrl: 'https://example.com/repo.git',
      branch: 'main',
      commitSha: 'abc123',
    })
    rocket.assignMission(mission)

    await injector.deploy(rocket)

    expect(git.cloned[0]).toEqual({ repoUrl: mission.repoUrl, branch: mission.branch })
    expect(docker.copyCalls[0]).toEqual({
      containerId: rocket.containerId,
      source: '/tmp/fake-repo',
      target: '/app',
    })
    expect(docker.commands.length).toBeGreaterThanOrEqual(4)
    expect(rocket.status).toBe(RocketStatus.ORBITING)
  })
})
