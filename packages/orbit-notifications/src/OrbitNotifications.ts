import type { GravitoOrbit, PlanetCore } from 'gravito-core'
import { NotificationManager } from './NotificationManager'
import { BroadcastChannel } from './channels/BroadcastChannel'
import { DatabaseChannel } from './channels/DatabaseChannel'
import { MailChannel } from './channels/MailChannel'
import { SlackChannel } from './channels/SlackChannel'
import { SmsChannel } from './channels/SmsChannel'

/**
 * OrbitNotifications 配置選項
 */
export interface OrbitNotificationsOptions {
  /**
   * 是否啟用郵件通道
   */
  enableMail?: boolean

  /**
   * 是否啟用資料庫通道
   */
  enableDatabase?: boolean

  /**
   * 是否啟用廣播通道
   */
  enableBroadcast?: boolean

  /**
   * 是否啟用 Slack 通道
   */
  enableSlack?: boolean

  /**
   * 是否啟用 SMS 通道
   */
  enableSms?: boolean

  /**
   * 自訂通道配置
   */
  channels?: Record<string, unknown>
}

/**
 * Notifications Orbit
 *
 * 提供通知系統功能，支援多種通道（郵件、資料庫、廣播、Slack、SMS）。
 */
export class OrbitNotifications implements GravitoOrbit {
  private options: OrbitNotificationsOptions

  constructor(options: OrbitNotificationsOptions = {}) {
    this.options = {
      enableMail: true,
      enableDatabase: true,
      enableBroadcast: true,
      enableSlack: false,
      enableSms: false,
      ...options,
    }
  }

  /**
   * 配置 OrbitNotifications
   */
  static configure(options: OrbitNotificationsOptions = {}): OrbitNotifications {
    return new OrbitNotifications(options)
  }

  async install(core: PlanetCore): Promise<void> {
    const manager = new NotificationManager(core)

    // 註冊預設通道
    if (this.options.enableMail) {
      const mail = core.services.get('mail') as
        | {
            send(message: import('./types').MailMessage): Promise<void>
          }
        | undefined

      if (mail) {
        manager.channel('mail', new MailChannel(mail))
      } else {
        core.logger.warn(
          '[OrbitNotifications] Mail service not found, mail channel disabled'
        )
      }
    }

    if (this.options.enableDatabase) {
      const db = core.services.get('db') as
        | {
            insertNotification(data: {
              notifiableId: string | number
              notifiableType: string
              type: string
              data: Record<string, unknown>
            }): Promise<void>
          }
        | undefined

      if (db) {
        manager.channel('database', new DatabaseChannel(db))
      } else {
        core.logger.warn(
          '[OrbitNotifications] Database service not found, database channel disabled'
        )
      }
    }

    if (this.options.enableBroadcast) {
      const broadcast = core.services.get('broadcast') as
        | {
            broadcast(
              channel: string,
              event: string,
              data: Record<string, unknown>
            ): Promise<void>
          }
        | undefined

      if (broadcast) {
        manager.channel('broadcast', new BroadcastChannel(broadcast))
      } else {
        core.logger.warn(
          '[OrbitNotifications] Broadcast service not found, broadcast channel disabled'
        )
      }
    }

    if (this.options.enableSlack) {
      const slack = this.options.channels?.slack as
        | {
            webhookUrl: string
            defaultChannel?: string
          }
        | undefined

      if (slack) {
        manager.channel('slack', new SlackChannel(slack))
      } else {
        core.logger.warn(
          '[OrbitNotifications] Slack configuration not found, slack channel disabled'
        )
      }
    }

    if (this.options.enableSms) {
      const sms = this.options.channels?.sms as
        | {
            provider: string
            apiKey?: string
            apiSecret?: string
            from?: string
          }
        | undefined

      if (sms) {
        manager.channel('sms', new SmsChannel(sms))
      } else {
        core.logger.warn(
          '[OrbitNotifications] SMS configuration not found, sms channel disabled'
        )
      }
    }

    // 註冊到 core services
    core.services.set('notifications', manager)

    // 嘗試整合隊列系統
    const queue = core.services.get('queue') as
      | {
          push(
            job: unknown,
            queue?: string,
            connection?: string,
            delay?: number
          ): Promise<void>
        }
      | undefined

    if (queue) {
      manager.setQueueManager({
        push: async (job, queueName, connection, delay) => {
          await queue.push(job, queueName, connection, delay)
        },
      })
    }

    core.logger.info('[OrbitNotifications] Installed')
  }
}

