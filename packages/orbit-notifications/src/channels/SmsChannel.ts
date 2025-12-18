import type { NotificationChannel, Notifiable } from '../types'
import type { Notification } from '../Notification'

/**
 * SMS 通道配置
 */
export interface SmsChannelConfig {
  provider: string
  apiKey?: string
  apiSecret?: string
  from?: string
}

/**
 * SMS 通道
 *
 * 通過 SMS 服務發送通知。
 * 目前僅提供基礎介面，實際實作需要根據不同的 SMS 提供商進行擴展。
 */
export class SmsChannel implements NotificationChannel {
  constructor(private config: SmsChannelConfig) {}

  async send(notification: Notification, notifiable: Notifiable): Promise<void> {
    if (!notification.toSms) {
      throw new Error('Notification does not implement toSms method')
    }

    const smsMessage = notification.toSms(notifiable)

    // 根據不同的提供商實作
    switch (this.config.provider) {
      case 'twilio':
        await this.sendViaTwilio(smsMessage)
        break
      case 'aws-sns':
        await this.sendViaAwsSns(smsMessage)
        break
      default:
        throw new Error(`Unsupported SMS provider: ${this.config.provider}`)
    }
  }

  /**
   * 通過 Twilio 發送 SMS
   */
  private async sendViaTwilio(message: import('../types').SmsMessage): Promise<void> {
    if (!this.config.apiKey || !this.config.apiSecret) {
      throw new Error('Twilio API key and secret are required')
    }

    const accountSid = this.config.apiKey
    const authToken = this.config.apiSecret

    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          Authorization: `Basic ${btoa(`${accountSid}:${authToken}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          From: this.config.from || '',
          To: message.to,
          Body: message.message,
        }),
      }
    )

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to send SMS via Twilio: ${error}`)
    }
  }

  /**
   * 通過 AWS SNS 發送 SMS
   */
  private async sendViaAwsSns(message: import('../types').SmsMessage): Promise<void> {
    // AWS SNS 實作需要 AWS SDK
    // 這裡僅提供介面，實際實作需要安裝 @aws-sdk/client-sns
    throw new Error('AWS SNS SMS provider not yet implemented. Please install @aws-sdk/client-sns')
  }
}

