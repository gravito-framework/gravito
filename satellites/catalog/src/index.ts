import { type Container, ServiceProvider } from 'gravito-core'
import { CreateProduct } from './Application/UseCases/CreateProduct'
import { UpdateCategory } from './Application/UseCases/UpdateCategory'
import { AtlasCategoryRepository } from './Infrastructure/Persistence/AtlasCategoryRepository'
import { AtlasProductRepository } from './Infrastructure/Persistence/AtlasProductRepository'
import { CategoryController } from './Interface/Http/Controllers/CategoryController'
import { ProductController } from './Interface/Http/Controllers/ProductController'

/**
 * Catalog Satellite Service Provider
 */
export class CatalogServiceProvider extends ServiceProvider {
  /**
   * Register bindings in the container
   */
  register(container: Container): void {
    // 1. Bind Repositories
    container.singleton('catalog.repo.category', () => new AtlasCategoryRepository())
    container.singleton('catalog.repo.product', () => new AtlasProductRepository())

    // 2. Bind UseCases
    container.singleton('catalog.create-product', () => {
      return new CreateProduct(container.make('catalog.repo.product'), this.core!)
    })

    container.singleton('catalog.update-category', () => {
      return new UpdateCategory(container.make('catalog.repo.category'), this.core!)
    })
  }

  /**
   * Expose migration path
   */
  getMigrationsPath(): string {
    return `${import.meta.dir}/Infrastructure/Persistence/Migrations`
  }

  /**
   * Boot the satellite
   */
  override async boot(): Promise<void> {
    const core = this.core
    if (!core) return

    const productCtrl = new ProductController()
    const categoryCtrl = new CategoryController()

    // Register Routes
    core.router.prefix('/api/catalog').group((router) => {
      router.get('/products', (c) => productCtrl.index(c))
      router.get('/products/:id', (c) => productCtrl.show(c))
      router.post('/products', (c) => productCtrl.store(c))

      router.get('/categories', (c) => categoryCtrl.index(c))
    })

    core.logger.info('🛰️ Satellite Catalog is operational')
  }
}
