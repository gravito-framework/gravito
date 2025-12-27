import type { DomainEvent } from './DomainEvent'

/**
 * Base Entity
 *
 * Entities have identity and lifecycle.
 * They can also record domain events that occurred during their lifecycle.
 */
export abstract class Entity<TId> {
  protected readonly _id: TId
  private _domainEvents: DomainEvent[] = []

  constructor(id: TId) {
    this._id = id
  }

  get id(): TId {
    return this._id
  }

  /**
   * Equality check based on ID.
   */
  public equals(other: Entity<TId>): boolean {
    if (other === null || other === undefined) {
      return false
    }
    if (this === other) {
      return true
    }
    if (!(other instanceof Entity)) {
      return false
    }
    return this._id === other._id
  }

  /**
   * Add a domain event to the entity.
   */
  protected addDomainEvent(event: DomainEvent): void {
    this._domainEvents.push(event)
  }

  /**
   * Get and clear recorded domain events.
   * Useful when committing the entity to a repository.
   */
  public pullDomainEvents(): DomainEvent[] {
    const events = [...this._domainEvents]
    this._domainEvents = []
    return events
  }

  /**
   * Clear recorded domain events without returning them.
   */
  public clearDomainEvents(): void {
    this._domainEvents = []
  }
}
