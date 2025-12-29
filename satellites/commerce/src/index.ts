import { type Container, ServiceProvider } from 'gravito-core'
import { RewardSubscriber } from './Application/Subscribers/RewardSubscriber'
import { PlaceOrder } from './Application/UseCases/PlaceOrder'
import { CheckoutController } from './Interface/Http/Controllers/CheckoutController'

export class CommerceServiceProvider extends ServiceProvider {
  register(container: Container): void {
    // Bind the core order engine
    container.singleton('commerce.place-order', () => {
      return new PlaceOrder(this.core!)
    })
  }

  getMigrationsPath(): string {
    return `${import.meta.dir}/Infrastructure/Persistence/Migrations`
  }

  override async boot(): Promise<void> {
    const core = this.core
    if (!core) return

    const checkoutCtrl = new CheckoutController()
    const rewardSub = new RewardSubscriber(core)

    // 註冊事件監聽
    core.hooks.addAction('commerce:order-placed', (payload: any) => {
      rewardSub.handleOrderPlaced(payload as { orderId: string })
    })

    /**
     * GASS 聯動：監聽支付成功 (來自 Payment 衛星)
     */
    core.hooks.addAction('payment:succeeded', async (payload: { orderId: string }) => {
      core.logger.info(`[Commerce] Order ${payload.orderId} confirmed as PAID.`)
      // 這裡通常會調用 Order.markAsPaid() 並持久化，目前暫由 Log 表現閉環
    })

    // Register Routes
    core.router.prefix('/api/commerce').group((router) => {
      router.post('/checkout', (c) => checkoutCtrl.store(c))
    })

    core.logger.info('🛰️ Satellite Commerce is operational')
  }
}
