/**
 * @gravito/orbit-notifications
 *
 * 輕量、高效的通知系統，支援多種通道（郵件、資料庫、廣播、Slack、SMS）。
 */

export { Notification } from './Notification'
export type { ShouldQueue } from './Notification'
export { NotificationManager } from './NotificationManager'
export { OrbitNotifications } from './OrbitNotifications'
export type { OrbitNotificationsOptions } from './OrbitNotifications'
export { BroadcastChannel } from './channels/BroadcastChannel'
export { DatabaseChannel } from './channels/DatabaseChannel'
export { MailChannel } from './channels/MailChannel'
export { SlackChannel } from './channels/SlackChannel'
export type { SlackChannelConfig } from './channels/SlackChannel'
export { SmsChannel } from './channels/SmsChannel'
export type { SmsChannelConfig } from './channels/SmsChannel'
export type {
  BroadcastNotification,
  DatabaseNotification,
  MailMessage,
  Notifiable,
  NotificationChannel,
  SlackMessage,
  SmsMessage,
} from './types'

