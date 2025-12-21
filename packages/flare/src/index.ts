/**
 * @gravito/flare
 *
 * Lightweight, high-performance notifications with multiple channels (mail, database, broadcast, Slack, SMS).
 */

export { BroadcastChannel } from './channels/BroadcastChannel'
export { DatabaseChannel } from './channels/DatabaseChannel'
export { MailChannel } from './channels/MailChannel'
export type { SlackChannelConfig } from './channels/SlackChannel'
export { SlackChannel } from './channels/SlackChannel'
export type { SmsChannelConfig } from './channels/SmsChannel'
export { SmsChannel } from './channels/SmsChannel'
export type { ShouldQueue } from './Notification'
export { Notification } from './Notification'
export { NotificationManager } from './NotificationManager'
export type { OrbitFlareOptions } from './OrbitFlare'
export { OrbitFlare } from './OrbitFlare'
export type {
  BroadcastNotification,
  DatabaseNotification,
  MailMessage,
  Notifiable,
  NotificationChannel,
  SlackMessage,
  SmsMessage,
} from './types'
