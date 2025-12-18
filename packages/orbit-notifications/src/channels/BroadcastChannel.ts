import type { NotificationChannel, Notifiable } from '../types'
import type { Notification } from '../Notification'

/**
 * 廣播通道
 *
 * 通過廣播服務發送通知。
 */
export class BroadcastChannel implements NotificationChannel {
  constructor(
    private broadcastService: {
      broadcast(channel: string, event: string, data: Record<string, unknown>): Promise<void>
    }
  ) {}

  async send(notification: Notification, notifiable: Notifiable): Promise<void> {
    if (!notification.toBroadcast) {
      throw new Error('Notification does not implement toBroadcast method')
    }

    const broadcastNotification = notification.toBroadcast(notifiable)
    const notifiableId = notifiable.getNotifiableId()
    const notifiableType = notifiable.getNotifiableType?.() || 'user'

    // 廣播到私有頻道
    const channel = `private-${notifiableType}.${notifiableId}`

    await this.broadcastService.broadcast(
      channel,
      broadcastNotification.type,
      broadcastNotification.data
    )
  }
}

