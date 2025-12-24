# @gravito/echo

> Gravito 的企業級 Webhook 模組，安全接收與可靠發送。

## 安裝

```bash
bun add @gravito/echo
```

## 快速開始

```typescript
import { OrbitEcho, WebhookReceiver } from '@gravito/echo'

const core = new PlanetCore()

core.install(new OrbitEcho({
  providers: {
    stripe: { name: 'stripe', secret: process.env.STRIPE_WEBHOOK_SECRET! },
    github: { name: 'github', secret: process.env.GITHUB_WEBHOOK_SECRET! }
  }
}))

const receiver = core.container.make<WebhookReceiver>('echo.receiver')

receiver.on('stripe', 'payment_intent.succeeded', async (event) => {
  console.log('Payment received:', event.payload)
})
```
