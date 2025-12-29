import { DB } from '@gravito/atlas'
import type { IPaymentRepository } from '../../Domain/Contracts/IPaymentRepository'
import type { Payment } from '../../Domain/Entities/Payment'

export class AtlasPaymentRepository implements IPaymentRepository {
  async save(entity: Payment): Promise<void> {
    // Dogfooding: Use @gravito/atlas for persistence
    console.log('[Atlas] Saving entity:', entity.id)
    // await DB.table('payments').insert({ ... })
  }

  async findById(id: string): Promise<Payment | null> {
    return null
  }

  async findAll(): Promise<Payment[]> {
    return []
  }

  async delete(id: string): Promise<void> {}

  async exists(id: string): Promise<boolean> {
    return false
  }
}
