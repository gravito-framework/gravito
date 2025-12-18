/**
 * 事件系統類型定義
 */

/**
 * 監聽器介面
 * 所有事件監聽器都必須實作此介面
 */
export interface Listener<TEvent extends Event = Event> {
  /**
   * 處理事件
   * @param event - 事件實例
   */
  handle(event: TEvent): Promise<void> | void
}

/**
 * 應該被隊列化的監聽器標記介面
 * 實作此介面的監聽器會被推送到隊列中異步執行
 */
export interface ShouldQueue {
  /**
   * 隊列名稱（可選）
   */
  queue?: string

  /**
   * 連接名稱（可選）
   */
  connection?: string

  /**
   * 延遲執行時間（秒）
   */
  delay?: number
}

/**
 * 應該被廣播的事件標記介面
 * 實作此介面的事件會被自動廣播到客戶端
 */
export interface ShouldBroadcast {
  /**
   * 指定廣播頻道
   * @returns 頻道名稱或頻道物件
   */
  broadcastOn(): string | Channel

  /**
   * 指定廣播資料（可選）
   * 如果不實作，將使用事件的公開屬性
   * @returns 要廣播的資料
   */
  broadcastWith?(): Record<string, unknown>

  /**
   * 指定廣播事件名稱（可選）
   * 如果不實作，將使用事件類別名稱
   * @returns 事件名稱
   */
  broadcastAs?(): string
}

/**
 * 頻道介面
 */
export interface Channel {
  /**
   * 頻道名稱
   */
  name: string

  /**
   * 頻道類型
   */
  type: 'public' | 'private' | 'presence'
}

/**
 * 事件基礎類別
 * 所有事件都應該繼承此類別
 */
export abstract class Event {
  /**
   * 事件是否應該被廣播
   */
  shouldBroadcast(): boolean {
    return 'broadcastOn' in this && typeof (this as unknown as ShouldBroadcast).broadcastOn === 'function'
  }

  /**
   * 獲取廣播頻道
   */
  getBroadcastChannel(): string | Channel | null {
    if (this.shouldBroadcast()) {
      return (this as unknown as ShouldBroadcast).broadcastOn()
    }
    return null
  }

  /**
   * 獲取廣播資料
   */
  getBroadcastData(): Record<string, unknown> {
    if (this.shouldBroadcast()) {
      const broadcast = this as unknown as ShouldBroadcast
      if (broadcast.broadcastWith) {
        return broadcast.broadcastWith()
      }
      // 預設使用事件的公開屬性
      const data: Record<string, unknown> = {}
      for (const [key, value] of Object.entries(this)) {
        if (!key.startsWith('_') && typeof value !== 'function') {
          data[key] = value
        }
      }
      return data
    }
    return {}
  }

  /**
   * 獲取廣播事件名稱
   */
  getBroadcastEventName(): string {
    if (this.shouldBroadcast()) {
      const broadcast = this as unknown as ShouldBroadcast
      if (broadcast.broadcastAs) {
        return broadcast.broadcastAs()
      }
    }
    // 預設使用類別名稱
    return this.constructor.name
  }
}

