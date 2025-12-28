import type { ICatalogRepository } from '../../Domain/Contracts/ICatalogRepository'
import type { Catalog } from '../../Domain/Entities/Catalog'

export class AtlasCatalogRepository implements ICatalogRepository {
  async save(entity: Catalog): Promise<void> {
    // Dogfooding: Use @gravito/atlas for persistence
    console.log('[Atlas] Saving entity:', entity.id)
    // await DB.table('catalogs').insert({ ... })
  }

  async findById(_id: string): Promise<Catalog | null> {
    return null
  }

  async findAll(): Promise<Catalog[]> {
    return []
  }

  async delete(_id: string): Promise<void> {}

  async exists(_id: string): Promise<boolean> {
    return false
  }
}
