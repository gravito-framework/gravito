# @gravito/flare

> Gravito 的通知模組，支援郵件、資料庫、廣播、Slack、SMS 等多種通道。

## 安裝

```bash
bun add @gravito/flare
```

## 快速開始

```typescript
import { Notification } from '@gravito/flare'
import type { MailMessage, Notifiable } from '@gravito/flare'

class WelcomeUser extends Notification {
  via(user: Notifiable): string[] {
    return ['mail']
  }

  toMail(user: Notifiable): MailMessage {
    return {
      subject: 'Welcome!',
      view: 'emails.welcome',
      to: user.email,
    }
  }
}
```

```typescript
const notifications = c.get('notifications')
await notifications.send(user, new WelcomeUser())
```
