import { randomUUID } from 'node:crypto'

export type Product = {
  id: string
  name: string
  sku: string
  price: number
  inventory: number
}

export class ProductService {
  private products: Map<string, Product> = new Map()

  constructor() {
    this.seed()
  }

  private seed() {
    const seedItems: Product[] = [
      { id: randomUUID(), name: 'Stellar Chair', sku: 'STL-CHAIR', price: 149.99, inventory: 12 },
      { id: randomUUID(), name: 'Orbit Desk', sku: 'ORT-DESK', price: 349.0, inventory: 5 },
    ]
    for (const product of seedItems) {
      this.products.set(product.id, product)
    }
  }

  list(): Product[] {
    return Array.from(this.products.values())
  }

  create(payload: Omit<Product, 'id'>): Product {
    const product: Product = { id: randomUUID(), ...payload }
    this.products.set(product.id, product)
    return product
  }

  update(id: string, payload: Partial<Omit<Product, 'id'>>): Product | null {
    const existing = this.products.get(id)
    if (!existing) return null
    const updated = { ...existing, ...payload }
    this.products.set(id, updated)
    return updated
  }

  delete(id: string): boolean {
    return this.products.delete(id)
  }

  find(id: string): Product | null {
    return this.products.get(id) ?? null
  }
}
