import { createWorkflow } from '@gravito/flux'

export interface OrderItem {
  productId: string
  qty: number
}

export interface OrderWorkflowInput {
  orderId: string
  userId: string
  items: OrderItem[]
}

export interface OrderWorkflowData {
  validatedAt: string
  reservedItems: Record<string, number>
  payment: {
    amount: number
    captured: boolean
  }
  notification: string
  [key: string]: any
}

const inventory = new Map<string, number>([
  ['widget-a', 5],
  ['widget-b', 1000],
  ['widget-c', 8],
])

const errorTracker = new Map<string, number>()

export const orderWorkflow = createWorkflow('flux-enterprise-order')
  .input<OrderWorkflowInput>()
  .data<OrderWorkflowData>()
  .step('validate-order', (ctx) => {
    if (!ctx.input.orderId.trim()) {
      throw new Error('orderId is required')
    }

    if (!ctx.input.userId.trim()) {
      throw new Error('userId is required')
    }

    if (ctx.input.items.length === 0) {
      throw new Error('order must contain at least one item')
    }

    for (const item of ctx.input.items) {
      if (item.qty <= 0) {
        throw new Error('item quantity must be greater than zero')
      }
    }

    ctx.data.validatedAt = new Date().toISOString()
  })
  .step(
    'reserve-stock',
    (ctx) => {
      const attempt = (errorTracker.get(ctx.input.orderId) ?? 0) + 1
      errorTracker.set(ctx.input.orderId, attempt)

      // Always fail first attempt to show retry UI
      if (attempt === 1) {
        throw new Error('simulated reservation conflict to exercise retry')
      }

      // 30% chance to fail subsequent attempts (simulating persistent outage)
      if (Math.random() < 0.6) {
        throw new Error('Random system instability detected')
      }

      const reserved: Record<string, number> = {}

      for (const item of ctx.input.items) {
        const available = inventory.get(item.productId) ?? 0
        if (item.qty > available) {
          throw new Error(`Not enough stock for ${item.productId}`)
        }
        inventory.set(item.productId, available - item.qty)
        reserved[item.productId] = item.qty
      }

      ctx.data.reservedItems = reserved
    },
    { retries: 2, timeout: 5000 }
  )
  .commit('charge-payment', async (ctx) => {
    await new Promise((resolve) => setTimeout(resolve, 150))
    ctx.data.payment = {
      amount: ctx.input.items.reduce((sum, item) => sum + item.qty * 100, 0),
      captured: true,
    }
  })
  .commit('notify-customer', async (ctx) => {
    await new Promise((resolve) => setTimeout(resolve, 50))
    ctx.data.notification = `sent to ${ctx.input.userId}`
  })

export default orderWorkflow
