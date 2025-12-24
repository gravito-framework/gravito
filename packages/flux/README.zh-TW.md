# @gravito/flux

> Gravito 的高效能工作流程引擎，跨平台、型別安全的狀態機。

## 安裝

```bash
bun add @gravito/flux
```

## 快速開始

```typescript
import { FluxEngine, createWorkflow } from '@gravito/flux'

const orderFlow = createWorkflow('order-process')
  .input<{ orderId: string }>()
  .step('fetch', async (ctx) => {
    ctx.data.order = await db.orders.find(ctx.input.orderId)
  })
  .step('validate', async (ctx) => {
    if (!ctx.data.order.isPaid) throw new Error('Unpaid order')
  })
  .commit('fulfill', async (ctx) => {
    await fulfillment.ship(ctx.data.order)
  })

const engine = new FluxEngine()
const result = await engine.execute(orderFlow, { orderId: '123' })
```
