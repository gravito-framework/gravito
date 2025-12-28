import { Entity } from '@gravito/enterprise'

export interface CatalogProps {
  name: string
  createdAt: Date
}

export class Catalog extends Entity<string> {
  constructor(
    id: string,
    private props: CatalogProps
  ) {
    super(id)
  }

  static create(id: string, name: string): Catalog {
    return new Catalog(id, {
      name,
      createdAt: new Date(),
    })
  }

  get name() {
    return this.props.name
  }
}
