import { type Container, ServiceProvider } from 'gravito-core'
import { ProcessPayment } from './Application/UseCases/ProcessPayment'
import { RefundPayment } from './Application/UseCases/RefundPayment'
import { StripeGateway } from './Infrastructure/Gateways/StripeGateway'

export class PaymentServiceProvider extends ServiceProvider {
  register(container: Container): void {
    // 1. 綁定網關
    container.singleton('payment.gateway.stripe', () => new StripeGateway())

    // 2. 綁定 UseCase
    container.singleton('payment.process', (c) => {
      return new ProcessPayment(c.make('payment.gateway.stripe'))
    })

    container.singleton('payment.refund', (c) => {
      return new RefundPayment(c.make('payment.gateway.stripe'))
    })
  }

  boot(): void {
    const core = this.core
    if (!core) return

    core.logger.info('🛰️ Satellite Payment is operational')

    /**
     * GASS 聯動：監聽訂單建立 (commerce:order:created)
     */
    core.hooks.addAction('commerce:order:created', async (payload: any) => {
      core.logger.info(`[Payment] Auto-processing payment for order: ${payload.order.id}`)

      const processPayment = core.container.make<ProcessPayment>('payment.process')

      try {
        const intent = await processPayment.execute({
          orderId: payload.order.id,
          amount: payload.order.total,
          currency: 'USD',
          gateway: 'stripe',
        })

        // 發射支付已準備行動
        await core.hooks.doAction('payment:intent:ready', { orderId: payload.order.id, intent })
      } catch (error: any) {
        core.logger.error(`[Payment] Failed to process payment: ${error.message}`)
      }
    })

    /**
     * GASS 聯動：監聽退款請求
     */
    core.hooks.addAction('commerce:order:refund-requested', async (payload: any) => {
      core.logger.info(`[Payment] Auto-refunding for order: ${payload.orderId}`)

      const refundPayment = core.container.make<RefundPayment>('payment.refund')

      try {
        await refundPayment.execute({
          gatewayTransactionId: payload.gatewayId,
          amount: payload.amount,
        })

        await core.hooks.doAction('payment:refund:succeeded', { orderId: payload.orderId })
      } catch (error: any) {
        core.logger.error(`[Payment] Refund failed: ${error.message}`)
      }
    })
  }
}
