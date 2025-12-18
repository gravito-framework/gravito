import type { NotificationChannel, Notifiable } from '../types'
import type { Notification } from '../Notification'

/**
 * Slack 通道配置
 */
export interface SlackChannelConfig {
  webhookUrl: string
  defaultChannel?: string
}

/**
 * Slack 通道
 *
 * 通過 Slack Webhook 發送通知。
 */
export class SlackChannel implements NotificationChannel {
  constructor(private config: SlackChannelConfig) {}

  async send(notification: Notification, notifiable: Notifiable): Promise<void> {
    if (!notification.toSlack) {
      throw new Error('Notification does not implement toSlack method')
    }

    const slackMessage = notification.toSlack(notifiable)

    // 發送到 Slack Webhook
    const response = await fetch(this.config.webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text: slackMessage.text,
        channel: slackMessage.channel || this.config.defaultChannel,
        username: slackMessage.username,
        icon_emoji: slackMessage.iconEmoji,
        attachments: slackMessage.attachments,
      }),
    })

    if (!response.ok) {
      throw new Error(`Failed to send Slack notification: ${response.statusText}`)
    }
  }
}

