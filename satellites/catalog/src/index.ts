import { type Container, ServiceProvider } from 'gravito-core'
import { RecoverStock } from './Application/UseCases/RecoverStock'

export class CatalogServiceProvider extends ServiceProvider {
  register(container: Container): void {
    container.singleton('catalog.stock.recover', () => new RecoverStock())
  }

  override boot(): void {
    const core = this.core
    if (!core) return

    core.logger.info('🛰️ Satellite Catalog is operational')

    /**
     * GASS 聯動：監聽退款成功，自動恢復庫存
     */
    core.hooks.addAction(
      'payment:refund:succeeded',
      async (payload: { orderId: string; items: any[] }) => {
        const recoverStock = core.container.make<RecoverStock>('catalog.stock.recover')

        try {
          // payload.items 應包含變體 ID 與數量
          for (const item of payload.items) {
            await recoverStock.execute({
              variantId: item.variantId,
              quantity: item.quantity,
            })
          }
          core.logger.info(`[Catalog] Inventory closure completed for order: ${payload.orderId}`)
        } catch (error: any) {
          core.logger.error(`[Catalog] Failed to recover stock: ${error.message}`)
        }
      }
    )
  }
}
