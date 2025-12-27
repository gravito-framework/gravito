/**
 * Domain Event
 *
 * Represents something that happened in the domain.
 * Domain events are immutable and should be named in the past tense.
 */
export abstract class DomainEvent {
  public readonly occurredOn: Date
  public readonly eventId: string

  constructor(eventId?: string, occurredOn?: Date) {
    this.eventId = eventId || crypto.randomUUID()
    this.occurredOn = occurredOn || new Date()
  }

  /**
   * The name of the event.
   * Defaults to the class name.
   */
  get eventName(): string {
    return this.constructor.name
  }
}
