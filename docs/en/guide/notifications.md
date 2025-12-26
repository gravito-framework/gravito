---
title: Notifications
description: Learn how to send notifications via multiple channels (Mail, Database, Slack).
---

# Notifications

> With `@gravito/flare`, you can easily send notifications to multiple channels, such as email, database storage, or Slack channels.

## Creating a Notification

The notification class defines how the notification is delivered and the content for each channel.

```typescript
import { Notification } from '@gravito/flare'

export class OrderShipped extends Notification {
  constructor(private order: any) {
    super()
  }

  // Define channels to send via
  via(user: any): string[] {
    return ['mail', 'database']
  }

  // Email content
  toMail(user: any) {
    return {
      subject: `Your Order #${this.order.id} has Shipped`,
      view: 'emails/shipped',
      data: { order: this.order }
    }
  }

  // Database storage content
  toDatabase(user: any) {
    return {
      type: 'order_shipped',
      data: { order_id: this.order.id }
    }
  }
}
```

## Sending a Notification

You can use the `NotificationManager` to send notifications:

```typescript
core.app.post('/orders/:id/ship', async (c) => {
  const notifications = c.get('notifications')
  const user = await User.find(1)

  await notifications.send(user, new OrderShipped(order))

  return c.json({ message: 'Notification sent' })
})
```

## Background Processing

Notifications are sent immediately by default. To send them asynchronously, have the notification class implement `ShouldQueue`:

```typescript
import { ShouldQueue } from '@gravito/flare'

export class OrderShipped extends Notification implements ShouldQueue {
  queue = 'notifications'
  // ...
}
```

---

## Next Steps
Learn how to implement real-time interactions with the [Broadcasting System](./broadcasting.md).
