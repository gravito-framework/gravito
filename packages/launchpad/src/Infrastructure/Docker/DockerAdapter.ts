import type { IDockerAdapter } from '../../Domain/Interfaces'

export class DockerAdapter implements IDockerAdapter {
  private baseImage = 'oven/bun:1.0-slim'

  /**
   * 建立一個預熱過的基礎容器
   * 使用 tail -f /dev/null 讓容器保持運行
   */
  async createBaseContainer(): Promise<string> {
    const rocketId = `rocket-${Math.random().toString(36).substring(2, 9)}`

    const proc = Bun.spawn([
      'docker',
      'run',
      '-d',
      '--name',
      rocketId,
      '--label',
      'gravito-origin=launchpad',
      this.baseImage,
      'tail',
      '-f',
      '/dev/null',
    ])

    const stdout = await new Response(proc.stdout).text()
    if (proc.exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text()
      throw new Error(`Docker 容器建立失敗: ${stderr}`)
    }

    return stdout.trim() // 回傳長 ID
  }

  /**
   * 透過 docker cp 注入檔案
   */
  async copyFiles(containerId: string, sourcePath: string, targetPath: string): Promise<void> {
    const proc = Bun.spawn(['docker', 'cp', sourcePath, `${containerId}:${targetPath}`])

    await proc.exited
    if (proc.exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text()
      throw new Error(`Docker 檔案拷貝失敗: ${stderr}`)
    }
  }

  /**
   * 執行容器內部指令
   */
  async executeCommand(
    containerId: string,
    command: string[]
  ): Promise<{ stdout: string; stderr: string; exitCode: number }> {
    const proc = Bun.spawn(['docker', 'exec', containerId, ...command])

    const stdout = await new Response(proc.stdout).text()
    const stderr = await new Response(proc.stderr).text()
    await proc.exited

    return {
      stdout,
      stderr,
      exitCode: proc.exitCode ?? -1,
    }
  }

  /**
   * 強制移除容器
   */
  async removeContainer(containerId: string): Promise<void> {
    const proc = Bun.spawn(['docker', 'rm', '-f', containerId])

    await proc.exited
  }
}
