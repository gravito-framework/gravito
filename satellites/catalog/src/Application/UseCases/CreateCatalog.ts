import { UseCase } from '@gravito/enterprise'
import type { ICatalogRepository } from '../../Domain/Contracts/ICatalogRepository'
import { Catalog } from '../../Domain/Entities/Catalog'

export interface CreateCatalogInput {
  name: string
}

export class CreateCatalog extends UseCase<CreateCatalogInput, string> {
  constructor(private repository: ICatalogRepository) {
    super()
  }

  async execute(input: CreateCatalogInput): Promise<string> {
    const id = crypto.randomUUID()
    const entity = Catalog.create(id, input.name)

    await this.repository.save(entity)

    return id
  }
}
