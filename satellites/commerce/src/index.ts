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

    // 註冊事件監聽 (增加類型斷言)
    core.hooks.addAction('commerce:order-placed', (payload: any) => {
      rewardSub.handleOrderPlaced(payload as { orderId: string })
    })

    // Register Routes
    core.router.prefix('/api/commerce').group((router) => {
      router.post('/checkout', (c) => checkoutCtrl.store(c))
    })

    core.logger.info('🛰️ Satellite Commerce is operational')
  }
}
