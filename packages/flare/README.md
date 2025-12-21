# @gravito/flare

輕量、高效的通知系統，支援多種通道（郵件、資料庫、廣播、Slack、SMS）。借鑑 Laravel 架構但保持 Gravito 的核心價值（高效能、低耗、輕量、AI 友善）。

> **狀態**：v0.1.0 - 核心功能已完成，支援多種通知通道

## 特性

- **零運行時開銷**：純類型包裝，直接委派給驅動
- **多通道支援**：郵件、資料庫、廣播、Slack、SMS
- **完全模組化**：按需安裝通道，核心包極小
- **隊列化支援**：整合 `@gravito/stream`，支援異步發送
- **AI 友善**：完整的型別推導、清晰的 JSDoc、直觀的 API

## 安裝

```bash
bun add @gravito/flare
```

## 快速開始

### 1. 建立通知類別

```typescript
import { Notification } from '@gravito/flare'
import type { MailMessage, DatabaseNotification, Notifiable } from '@gravito/flare'

class InvoicePaid extends Notification {
  constructor(private invoice: Invoice) {
    super()
  }

  via(user: Notifiable): string[] {
    return ['mail', 'database']
  }

  toMail(user: Notifiable): MailMessage {
    return {
      subject: 'Invoice Paid',
      view: 'emails.invoice-paid',
      data: { invoice: this.invoice },
      to: user.email,
    }
  }

  toDatabase(user: Notifiable): DatabaseNotification {
    return {
      type: 'invoice-paid',
      data: {
        invoice_id: this.invoice.id,
        amount: this.invoice.amount,
      },
    }
  }
}
```

### 2. 配置 OrbitFlare

```typescript
import { PlanetCore } from 'gravito-core'
import { OrbitFlare } from '@gravito/flare'
import { OrbitSignal } from '@gravito/signal'
import { OrbitStream } from '@gravito/stream'

const core = await PlanetCore.boot({
  orbits: [
    OrbitSignal.configure({ /* ... */ }),
    OrbitStream.configure({ /* ... */ }),
    OrbitFlare.configure({
      enableMail: true,
      enableDatabase: true,
      enableBroadcast: true,
      channels: {
        slack: {
          webhookUrl: 'https://hooks.slack.com/services/...',
        },
      },
    }),
  ],
})
```

### 3. 發送通知

```typescript
// 在 Controller 中
const notifications = c.get('notifications') as NotificationManager

await notifications.send(user, new InvoicePaid(invoice))
```

### 4. 隊列化通知

```typescript
import { Notification, ShouldQueue } from '@gravito/flare'

class SendEmailNotification extends Notification implements ShouldQueue {
  queue = 'notifications'
  delay = 60 // 延遲 60 秒

  via(user: Notifiable): string[] {
    return ['mail']
  }

  toMail(user: Notifiable): MailMessage {
    return {
      subject: 'Welcome!',
      to: user.email,
      view: 'emails.welcome',
    }
  }
}

// 自動推送到隊列
await notifications.send(user, new SendEmailNotification())
```

## 通道

### 郵件通道

需要安裝 `@gravito/signal`：

```typescript
via(user: Notifiable): string[] {
  return ['mail']
}

toMail(user: Notifiable): MailMessage {
  return {
    subject: 'Subject',
    view: 'emails.template',
    data: { /* ... */ },
    to: user.email,
  }
}
```

### 資料庫通道

需要資料庫服務支援：

```typescript
via(user: Notifiable): string[] {
  return ['database']
}

toDatabase(user: Notifiable): DatabaseNotification {
  return {
    type: 'notification-type',
    data: { /* ... */ },
  }
}
```

### 廣播通道

需要安裝 `@gravito/radiance`：

```typescript
via(user: Notifiable): string[] {
  return ['broadcast']
}

toBroadcast(user: Notifiable): BroadcastNotification {
  return {
    type: 'notification-type',
    data: { /* ... */ },
  }
}
```

### Slack 通道

```typescript
via(user: Notifiable): string[] {
  return ['slack']
}

toSlack(user: Notifiable): SlackMessage {
  return {
    text: 'Notification message',
    channel: '#notifications',
  }
}
```

### SMS 通道

```typescript
via(user: Notifiable): string[] {
  return ['sms']
}

toSms(user: Notifiable): SmsMessage {
  return {
    to: user.phone,
    message: 'Notification message',
  }
}
```

## API 參考

### Notification

所有通知都應該繼承 `Notification` 類別。

#### 方法

- `via(notifiable: Notifiable): string[]` - 指定通知通道（必須實作）
- `toMail(notifiable: Notifiable): MailMessage` - 郵件訊息（可選）
- `toDatabase(notifiable: Notifiable): DatabaseNotification` - 資料庫通知（可選）
- `toBroadcast(notifiable: Notifiable): BroadcastNotification` - 廣播通知（可選）
- `toSlack(notifiable: Notifiable): SlackMessage` - Slack 訊息（可選）
- `toSms(notifiable: Notifiable): SmsMessage` - SMS 訊息（可選）

### NotificationManager

#### 方法

- `send(notifiable: Notifiable, notification: Notification): Promise<void>` - 發送通知
- `channel(name: string, channel: NotificationChannel): void` - 註冊自訂通道

## 授權

MIT © Carl Lee

