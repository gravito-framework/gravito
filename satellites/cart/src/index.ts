import { type Container, ServiceProvider } from 'gravito-core'
import { AddToCart } from './Application/UseCases/AddToCart'
import { MergeCart } from './Application/UseCases/MergeCart'
import { AtlasCartRepository } from './Infrastructure/Persistence/Repositories/AtlasCartRepository'
import { CartController } from './Interface/Http/Controllers/CartController'

export class CartServiceProvider extends ServiceProvider {
  register(container: Container): void {
    // 1. 綁定存儲 (根據模式切換)
    container.singleton('cart.repository', () => new AtlasCartRepository())

    // 2. 綁定業務邏輯
    container.singleton('cart.add-item', () => {
      return new AddToCart(container.make('cart.repository'))
    })

    container.singleton('cart.merge', () => {
      return new MergeCart(container.make('cart.repository'))
    })
  }

  getMigrationsPath(): string {
    return `${import.meta.dir}/Infrastructure/Persistence/Migrations`
  }

  override async boot(): Promise<void> {
    const core = this.core
    if (!core) return

    const cartCtrl = new CartController()

    // 1. 註冊路由
    core.router.prefix('/api/cart').group((router) => {
      router.get('/', (c) => cartCtrl.index(c))
      router.post('/items', (c) => cartCtrl.store(c))
    })

    // 2. 🏎️ 絲滑聯動點：監聽會員登入事件執行自動合併
    core.hooks.addAction('member:logged-in', async (payload: any) => {
      if (payload.memberId && payload.guestId) {
        core.logger.info(`🔄 [Cart] 偵測到登入，正在合併訪客 (${payload.guestId}) 購物車...`)
        const merger = core.container.make<MergeCart>('cart.merge')
        await merger.execute({
          memberId: payload.memberId,
          guestId: payload.guestId,
        })
      }
    })

    core.logger.info('🛰️ Satellite Cart is operational')
  }
}
