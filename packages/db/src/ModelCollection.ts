/**
 * Model collection (similar to Laravel's Collection).
 */
export class ModelCollection<T> extends Array<T> {
  constructor(items: T[] = []) {
    super(...items)
    Object.setPrototypeOf(this, ModelCollection.prototype)
  }

  /**
   * Convert to a plain array.
   */
  toArray(): T[] {
    return [...this]
  }

  /**
   * Convert to JSON.
   */
  toJSON(): unknown[] {
    return this.map((item: T) => {
      if (
        item &&
        typeof item === 'object' &&
        'toJSON' in item &&
        typeof (item as { toJSON?: () => unknown }).toJSON === 'function'
      ) {
        return (item as { toJSON: () => unknown }).toJSON()
      }
      return item
    })
  }

  /**
   * Find the first item that matches a predicate.
   */

  override find(callback: (item: T, index: number, array: T[]) => boolean): T | undefined {
    return super.find(callback)
  }

  /**
   * Get the first item.
   */
  first(): T | undefined {
    return this[0]
  }

  /**
   * Get the last item.
   */
  last(): T | undefined {
    return this[this.length - 1]
  }

  /**
   * Map.
   */

  override map<U>(callback: (item: T, index: number, array: T[]) => U): ModelCollection<U> {
    return new ModelCollection(super.map(callback))
  }

  /**
   * Filter.
   */

  override filter(callback: (item: T, index: number, array: T[]) => boolean): ModelCollection<T> {
    return new ModelCollection(super.filter(callback))
  }
}
