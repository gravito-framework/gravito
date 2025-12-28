import type { Rocket } from './Rocket'

/**
 * 負責與底層容器引擎（如 Docker）溝通的轉接器介面
 */
export interface IDockerAdapter {
  createBaseContainer(): Promise<string>
  copyFiles(containerId: string, sourcePath: string, targetPath: string): Promise<void>
  executeCommand(
    containerId: string,
    command: string[]
  ): Promise<{ stdout: string; stderr: string; exitCode: number }>
  removeContainer(containerId: string): Promise<void>

  /**
   * 串流容器日誌
   */
  streamLogs(containerId: string, onData: (data: string) => void): void

  /**
   * 獲取容器效能數據
   */
  getStats(containerId: string): Promise<{ cpu: string; memory: string }>
}

/**
 * 負責代碼獲取
 */
export interface IGitAdapter {
  /**
   * 淺層複製代碼到本地暫存區，回傳暫存路徑
   */
  clone(repoUrl: string, branch: string): Promise<string>
}

/**
 * 負責持久化火箭狀態的儲存庫介面
 */
export interface IRocketRepository {
  save(rocket: Rocket): Promise<void>
  findById(id: string): Promise<Rocket | null>
  findIdle(): Promise<Rocket | null>
  findAll(): Promise<Rocket[]>
  delete(id: string): Promise<void>
}
