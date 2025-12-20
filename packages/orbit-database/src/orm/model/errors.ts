/**
 * Model Errors
 * @description Custom error types for ORM model operations
 */

/**
 * Column Not Found Error
 * Thrown when accessing/setting a column that doesn't exist in schema
 */
export class ColumnNotFoundError extends Error {
  constructor(
    public readonly table: string,
    public readonly column: string
  ) {
    super(`Column "${column}" does not exist on table "${table}".`)
    this.name = 'ColumnNotFoundError'
  }
}

/**
 * Type Mismatch Error
 * Thrown when setting a value with incompatible type
 */
export class TypeMismatchError extends Error {
  constructor(
    public readonly table: string,
    public readonly column: string,
    public readonly expectedType: string,
    public readonly actualType: string
  ) {
    super(
      `Type mismatch for column "${column}" on table "${table}". ` +
        `Expected ${expectedType}, got ${actualType}.`
    )
    this.name = 'TypeMismatchError'
  }
}

/**
 * Nullable Constraint Error
 * Thrown when setting null on a non-nullable column
 */
export class NullableConstraintError extends Error {
  constructor(
    public readonly table: string,
    public readonly column: string
  ) {
    super(`Column "${column}" on table "${table}" cannot be null.`)
    this.name = 'NullableConstraintError'
  }
}

/**
 * Model Not Found Error
 * Thrown when a model is not found in the database
 */
export class ModelNotFoundError extends Error {
  constructor(
    public readonly model: string,
    public readonly key: unknown
  ) {
    super(`${model} with key "${key}" not found.`)
    this.name = 'ModelNotFoundError'
  }
}
