import type { Notifiable } from './types'

/**
 * 應該被隊列化的通知標記介面
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
 * 通知基礎類別
 *
 * 所有通知都應該繼承此類別。
 * 通知可以通過多種通道發送（郵件、資料庫、廣播、Slack、SMS 等）。
 *
 * @example
 * ```typescript
 * class InvoicePaid extends Notification {
 *   constructor(private invoice: Invoice) {
 *     super()
 *   }
 *
 *   via(user: User): string[] {
 *     return ['mail', 'database']
 *   }
 *
 *   toMail(user: User): MailMessage {
 *     return new MailMessage()
 *       .subject('Invoice Paid')
 *       .view('emails.invoice-paid', { invoice: this.invoice })
 *   }
 *
 *   toDatabase(user: User): DatabaseNotification {
 *     return {
 *       type: 'invoice-paid',
 *       data: { invoice_id: this.invoice.id }
 *     }
 *   }
 * }
 * ```
 */
export abstract class Notification {
  /**
   * 指定通知應該通過哪些通道發送
   * @param notifiable - 接收通知的實體
   * @returns 通道名稱陣列
   */
  abstract via(notifiable: Notifiable): string[]

  /**
   * 獲取郵件訊息（可選）
   * 如果通知需要通過郵件通道發送，應該實作此方法
   */
  toMail?(_notifiable: Notifiable): import('./types').MailMessage {
    throw new Error('toMail method not implemented')
  }

  /**
   * 獲取資料庫通知（可選）
   * 如果通知需要通過資料庫通道發送，應該實作此方法
   */
  toDatabase?(_notifiable: Notifiable): import('./types').DatabaseNotification {
    throw new Error('toDatabase method not implemented')
  }

  /**
   * 獲取廣播通知（可選）
   * 如果通知需要通過廣播通道發送，應該實作此方法
   */
  toBroadcast?(_notifiable: Notifiable): import('./types').BroadcastNotification {
    throw new Error('toBroadcast method not implemented')
  }

  /**
   * 獲取 Slack 訊息（可選）
   * 如果通知需要通過 Slack 通道發送，應該實作此方法
   */
  toSlack?(_notifiable: Notifiable): import('./types').SlackMessage {
    throw new Error('toSlack method not implemented')
  }

  /**
   * 獲取 SMS 訊息（可選）
   * 如果通知需要通過 SMS 通道發送，應該實作此方法
   */
  toSms?(_notifiable: Notifiable): import('./types').SmsMessage {
    throw new Error('toSms method not implemented')
  }

  /**
   * 檢查通知是否應該被隊列化
   */
  shouldQueue(): boolean {
    return 'queue' in this || 'connection' in this || 'delay' in this
  }

  /**
   * 獲取隊列配置
   */
  getQueueConfig(): { queue?: string; connection?: string; delay?: number } {
    if (this.shouldQueue()) {
      const queueable = this as unknown as ShouldQueue
      return {
        queue: queueable.queue,
        connection: queueable.connection,
        delay: queueable.delay,
      }
    }
    return {}
  }
}

