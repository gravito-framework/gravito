import type { PlanetCore } from 'gravito-core'
import type { NotificationChannel, Notifiable } from './types'
import type { Notification } from './Notification'

/**
 * 通知管理器
 *
 * 負責管理通知通道並發送通知。
 */
export class NotificationManager {
  /**
   * 通道映射表
   */
  private channels = new Map<string, NotificationChannel>()

  /**
   * 隊列管理器（可選，由 orbit-queue 注入）
   */
  private queueManager?: {
    push(job: unknown, queue?: string, connection?: string, delay?: number): Promise<void>
  }

  constructor(private core: PlanetCore) {}

  /**
   * 註冊通知通道
   * @param name - 通道名稱
   * @param channel - 通道實例
   */
  channel(name: string, channel: NotificationChannel): void {
    this.channels.set(name, channel)
  }

  /**
   * 註冊隊列管理器
   * 由 orbit-queue 調用
   */
  setQueueManager(manager: NotificationManager['queueManager']): void {
    this.queueManager = manager
  }

  /**
   * 發送通知
   *
   * @param notifiable - 接收通知的實體
   * @param notification - 通知實例
   *
   * @example
   * ```typescript
   * await notificationManager.send(user, new InvoicePaid(invoice))
   * ```
   */
  async send(notifiable: Notifiable, notification: Notification): Promise<void> {
    const channels = notification.via(notifiable)

    // 檢查是否應該隊列化
    if (notification.shouldQueue() && this.queueManager) {
      const queueConfig = notification.getQueueConfig()

      // 創建隊列任務
      const queueJob = {
        type: 'notification',
        notification: notification.constructor.name,
        notifiableId: notifiable.getNotifiableId(),
        notifiableType: notifiable.getNotifiableType?.() || 'user',
        channels,
        notificationData: this.serializeNotification(notification),
        handle: async () => {
          await this.sendNow(notifiable, notification, channels)
        },
      }

      await this.queueManager.push(
        queueJob,
        queueConfig.queue,
        queueConfig.connection,
        queueConfig.delay
      )
      return
    }

    // 立即發送
    await this.sendNow(notifiable, notification, channels)
  }

  /**
   * 立即發送通知（不經過隊列）
   */
  private async sendNow(
    notifiable: Notifiable,
    notification: Notification,
    channels: string[]
  ): Promise<void> {
    for (const channelName of channels) {
      const channel = this.channels.get(channelName)
      if (!channel) {
        this.core.logger.warn(
          `[NotificationManager] Channel '${channelName}' not found, skipping`
        )
        continue
      }

      try {
        await channel.send(notification, notifiable)
      } catch (error) {
        this.core.logger.error(
          `[NotificationManager] Failed to send notification via '${channelName}':`,
          error
        )
        // 繼續發送其他通道
      }
    }
  }

  /**
   * 序列化通知（用於隊列化）
   */
  private serializeNotification(notification: Notification): Record<string, unknown> {
    const data: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(notification)) {
      if (!key.startsWith('_') && typeof value !== 'function') {
        data[key] = value
      }
    }
    return data
  }
}

