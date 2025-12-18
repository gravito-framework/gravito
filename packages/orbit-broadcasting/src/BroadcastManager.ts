import type { PlanetCore } from 'gravito-core'
import type { BroadcastDriver } from './drivers/BroadcastDriver'

/**
 * 頻道授權回調
 */
export type ChannelAuthorizationCallback = (
  channel: string,
  socketId: string,
  userId?: string | number
) => Promise<boolean>

/**
 * 廣播管理器
 *
 * 負責管理廣播驅動並處理廣播請求。
 */
export class BroadcastManager {
  private driver: BroadcastDriver | null = null
  private authCallback?: ChannelAuthorizationCallback

  constructor(private core: PlanetCore) {}

  /**
   * 設置廣播驅動
   */
  setDriver(driver: BroadcastDriver): void {
    this.driver = driver
  }

  /**
   * 設置頻道授權回調
   */
  setAuthCallback(callback: ChannelAuthorizationCallback): void {
    this.authCallback = callback
  }

  /**
   * 廣播事件
   *
   * @param event - 事件實例
   * @param channel - 頻道物件
   * @param data - 事件資料
   * @param eventName - 事件名稱
   */
  async broadcast(
    event: unknown,
    channel: { name: string; type: string },
    data: Record<string, unknown>,
    eventName: string
  ): Promise<void> {
    if (!this.driver) {
      this.core.logger.warn('[BroadcastManager] No broadcast driver set, skipping broadcast')
      return
    }

    try {
      await this.driver.broadcast(channel, eventName, data)
    } catch (error) {
      this.core.logger.error(`[BroadcastManager] Failed to broadcast event ${eventName}:`, error)
      throw error
    }
  }

  /**
   * 授權頻道存取
   *
   * @param channel - 頻道名稱
   * @param socketId - Socket ID
   * @param userId - 使用者 ID（可選）
   * @returns 授權資訊
   */
  async authorizeChannel(
    channel: string,
    socketId: string,
    userId?: string | number
  ): Promise<{ auth: string; channel_data?: string } | null> {
    // 檢查授權回調
    if (this.authCallback) {
      const authorized = await this.authCallback(channel, socketId, userId)
      if (!authorized) {
        return null
      }
    }

    // 如果驅動支援授權，使用它
    if (this.driver?.authorizeChannel) {
      return await this.driver.authorizeChannel(channel, socketId, userId)
    }

    // 預設拒絕私有頻道和存在頻道
    if (channel.startsWith('private-') || channel.startsWith('presence-')) {
      return null
    }

    // 公開頻道不需要授權
    return { auth: '' }
  }
}

