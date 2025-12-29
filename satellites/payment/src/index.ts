import { type Container, ServiceProvider } from 'gravito-core'
import { ProcessPayment } from './Application/UseCases/ProcessPayment'
import { RefundPayment } from './Application/UseCases/RefundPayment'
import { StripeGateway } from './Infrastructure/Gateways/StripeGateway'
import { StripeWebhookController } from './Interface/Http/Controllers/StripeWebhookController'

export class PaymentServiceProvider extends ServiceProvider {
  register(container: Container): void {
    // 1. 綁定網關 (顯式轉型)
    container.singleton('payment.gateway.stripe', () => {
      const apiKey = this.core?.config.get<string>('payment.stripe.secret') || 'mock_key'
      return new StripeGateway(apiKey)
    })

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

    const webhookCtrl = new StripeWebhookController()

    // 註冊 Webhook 路由
    core.router.post('/webhooks/payment/stripe', (c) => webhookCtrl.handle(c))

    core.logger.info('🛰️ Satellite Payment is operational (Stripe SDK Ready)')

    core.hooks.addAction('commerce:order:created', async (payload: any) => {
      const processPayment = core.container.make<ProcessPayment>('payment.process')
      try {
        const intent = await processPayment.execute({
          orderId: payload.order.id,
          amount: payload.order.totalAmount,
          currency: payload.order.currency,
          gateway: 'stripe',
        })
        await core.hooks.doAction('payment:intent:ready', { orderId: payload.order.id, intent })
      } catch (error: any) {
        core.logger.error(`[Payment] Process error: ${error.message}`)
      }
    })

    core.hooks.addAction('payment:succeeded', async (payload: any) => {
      core.logger.info(`[Payment] Completing order closure for: ${payload.orderId}`)
    })
  }
}
