/**
 * 廣播驅動介面
 *
 * 所有廣播驅動都必須實作此介面。
 */
export interface BroadcastDriver {
  /**
   * 廣播事件到頻道
   *
   * @param channel - 頻道物件（包含名稱和類型）
   * @param event - 事件名稱
   * @param data - 事件資料
   */
  broadcast(
    channel: { name: string; type: string },
    event: string,
    data: Record<string, unknown>
  ): Promise<void>

  /**
   * 授權頻道存取（用於私有頻道和存在頻道）
   *
   * @param channel - 頻道名稱
   * @param socketId - Socket ID
   * @param userId - 使用者 ID（可選）
   * @returns 授權資訊
   */
  authorizeChannel?(
    channel: string,
    socketId: string,
    userId?: string | number
  ): Promise<{ auth: string; channel_data?: string }>
}

