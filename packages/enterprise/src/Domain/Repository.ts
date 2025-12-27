import type { Entity } from './Entity'

/**
 * Generic Repository Interface
 *
 * Provides standard methods for persistence.
 * @template TEntity The entity type
 * @template TId The type of the entity's ID
 */
export interface Repository<TEntity extends Entity<TId>, TId> {
  save(entity: TEntity): Promise<void>
  findById(id: TId): Promise<TEntity | null>
  findAll(): Promise<TEntity[]>
  delete(id: TId): Promise<void>
  exists(id: TId): Promise<boolean>
}
