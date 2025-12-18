import type { NotificationChannel, Notifiable } from '../types'
import type { Notification } from '../Notification'

/**
 * 郵件通道
 *
 * 通過郵件服務發送通知。
 */
export class MailChannel implements NotificationChannel {
  constructor(
    private mailService: {
      send(message: import('../types').MailMessage): Promise<void>
    }
  ) {}

  async send(notification: Notification, notifiable: Notifiable): Promise<void> {
    if (!notification.toMail) {
      throw new Error('Notification does not implement toMail method')
    }

    const message = notification.toMail(notifiable)
    await this.mailService.send(message)
  }
}

