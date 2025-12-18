import type { BroadcastDriver } from './BroadcastDriver'

/**
 * WebSocket 連接
 */
export interface WebSocketConnection {
  send(data: string): void
  close(): void
  readyState: number
}

/**
 * WebSocket 驅動配置
 */
export interface WebSocketDriverConfig {
  /**
   * 獲取所有連接的 WebSocket
   */
  getConnections(): WebSocketConnection[]

  /**
   * 根據頻道過濾連接（可選）
   */
  filterConnectionsByChannel?(channel: string): WebSocketConnection[]
}

/**
 * WebSocket 驅動
 *
 * 通過 WebSocket 進行廣播。
 * 適用於單機部署或需要直接 WebSocket 連接的場景。
 */
export class WebSocketDriver implements BroadcastDriver {
  constructor(private config: WebSocketDriverConfig) {}

  async broadcast(
    channel: { name: string; type: string },
    event: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const message = JSON.stringify({
      channel: channel.name,
      event,
      data,
    })

    let connections = this.config.getConnections()

    // 如果支援頻道過濾，使用它
    if (this.config.filterConnectionsByChannel) {
      connections = this.config.filterConnectionsByChannel(channel.name)
    }

    // 發送到所有連接
    for (const connection of connections) {
      if (connection.readyState === 1) {
        // WebSocket.OPEN
        try {
          connection.send(message)
        } catch (error) {
          // 忽略發送失敗的連接
          console.error('Failed to send WebSocket message:', error)
        }
      }
    }
  }
}

