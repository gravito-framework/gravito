/**
 * Base Value Object
 *
 * Value objects are immutable and compared by structural equality (properties),
 * not by identity.
 */
export abstract class ValueObject<T> {
  protected readonly props: T

  constructor(props: T) {
    this.props = Object.freeze({ ...props })
  }

  /**
   * Check equality by comparing properties.
   */
  public equals(other: ValueObject<T>): boolean {
    if (other === null || other === undefined) {
      return false
    }
    if (this === other) {
      return true
    }
    if (other.constructor !== this.constructor) {
      return false
    }
    return JSON.stringify(this.props) === JSON.stringify(other.props)
  }
}
