/**
 * 通知系統類型定義
 */

/**
 * 通知通道介面
 */
export interface NotificationChannel {
  /**
   * 發送通知
   * @param notification - 通知實例
   * @param notifiable - 接收通知的實體
   */
  send(notification: Notification, notifiable: Notifiable): Promise<void>
}

/**
 * 可接收通知的實體介面
 */
export interface Notifiable {
  /**
   * 接收通知的識別符（通常是 ID）
   */
  getNotifiableId(): string | number

  /**
   * 接收通知的類型（可選，用於多態）
   */
  getNotifiableType?(): string

  /**
   * 接收通知的通道偏好（可選）
   */
  preferredNotificationChannels?(): string[]
}

/**
 * 郵件訊息介面
 */
export interface MailMessage {
  subject: string
  view?: string
  data?: Record<string, unknown>
  html?: string
  text?: string
  from?: string
  to?: string | string[]
  cc?: string | string[]
  bcc?: string | string[]
}

/**
 * 資料庫通知介面
 */
export interface DatabaseNotification {
  type: string
  data: Record<string, unknown>
  readAt?: Date | null
}

/**
 * 廣播通知介面
 */
export interface BroadcastNotification {
  type: string
  data: Record<string, unknown>
}

/**
 * Slack 訊息介面
 */
export interface SlackMessage {
  text: string
  channel?: string
  username?: string
  iconEmoji?: string
  attachments?: Array<{
    color?: string
    title?: string
    text?: string
    fields?: Array<{ title: string; value: string; short?: boolean }>
  }>
}

/**
 * SMS 訊息介面
 */
export interface SmsMessage {
  to: string
  message: string
  from?: string
}

