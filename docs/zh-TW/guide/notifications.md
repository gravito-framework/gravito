---
title: 通知系統 (Notifications)
description: 了解如何透過多渠道（郵件、資料庫、Slack）發送通知。
---

# 通知系統 (Notifications)

> 透過 `@gravito/flare`，您可以輕鬆地將通知發送到多個通路，如電子郵件、資料庫儲存或 Slack 頻道。

## 建立通知

通知類別定義了通知的傳遞方式與各個通路的內容。

```typescript
import { Notification } from '@gravito/flare'

export class OrderShipped extends Notification {
  constructor(private order: any) {
    super()
  }

  // 定義要發送的通路
  via(user: any): string[] {
    return ['mail', 'database']
  }

  // 電子郵件內容
  toMail(user: any) {
    return {
      subject: `您的訂單 #${this.order.id} 已出貨`,
      view: 'emails/shipped',
      data: { order: this.order }
    }
  }

  // 資料庫儲存內容
  toDatabase(user: any) {
    return {
      type: 'order_shipped',
      data: { order_id: this.order.id }
    }
  }
}
```

## 發送通知

您可以使用 `NotificationManager` 來發送通知：

```typescript
core.app.post('/orders/:id/ship', async (c) => {
  const notifications = c.get('notifications')
  const user = await User.find(1)

  await notifications.send(user, new OrderShipped(order))

  return c.json({ message: '通知已發送' })
})
```

## 背景處理

通知預設會立即發送。若要非同步發送，可以讓通知類別實作 `ShouldQueue`：

```typescript
import { ShouldQueue } from '@gravito/flare'

export class OrderShipped extends Notification implements ShouldQueue {
  queue = 'notifications'
  // ...
}
```

---

## 下一步
了解如何透過 [廣播系統](./broadcasting.md) 實現即時互動。
