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
      // Mount host bun cache to container to speed up install
      '-v',
      `${process.env.HOME}/.bun/install/cache:/home/bun/.bun/install/cache`,
      this.baseImage,
      'tail',
      '-f',
      '/dev/null',
    ])

    const stdout = await new Response(proc.stdout).text()
    const containerId = stdout.trim()

    // 如果 stdout 看起來像是一個 Container ID (64 char hex)，我們視為成功
    // 即使 exitCode 非 0 (可能是 warning)
    if (containerId.length === 64 && /^[0-9a-f]+$/.test(containerId)) {
      return containerId
    }

    if (proc.exitCode !== 0) {
      const stderr = await new Response(proc.stderr).text()
      console.error(`[Docker Error] Exit Code: ${proc.exitCode}`)
      console.error(`[Docker Error] Stdout: ${stdout}`)
      console.error(`[Docker Error] Stderr: ${stderr}`)
      throw new Error(`Docker 容器建立失敗: ${stderr || stdout || 'Unknown error'}`)
    }

    return containerId // 回傳長 ID
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

  /**

     * 串流容器日誌

     */

  streamLogs(containerId: string, onData: (data: string) => void): void {
    const proc = Bun.spawn(['docker', 'logs', '-f', containerId], {
      stdout: 'pipe',

      stderr: 'pipe',
    })

    // 處理 stdout

    const readStream = async (stream: ReadableStream) => {
      const reader = stream.getReader()

      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()

        if (done) break

        onData(decoder.decode(value))
      }
    }

    readStream(proc.stdout)

    readStream(proc.stderr)
  }

  /**

     * 獲取容器效能數據

     */

  async getStats(containerId: string): Promise<{ cpu: string; memory: string }> {
    const proc = Bun.spawn([
      'docker',
      'stats',
      containerId,
      '--no-stream',
      '--format',
      '{{.CPUPerc}},{{.MemUsage}}',
    ])

    const stdout = await new Response(proc.stdout).text()

    const [cpu, memory] = stdout.trim().split(',')

    return {
      cpu: cpu || '0%',

      memory: memory || '0B / 0B',
    }
  }
}
