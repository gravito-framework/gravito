import { GravitoException } from './GravitoException'

export interface ValidationError {
  field: string
  message: string
  code?: string
}

export class ValidationException extends GravitoException {
  public readonly errors: ValidationError[]
  public redirectTo?: string
  public input?: unknown

  constructor(errors: ValidationError[], message = 'Validation failed') {
    super(422, 'VALIDATION_ERROR', {
      message,
      i18nKey: 'errors.validation.failed',
    })
    this.errors = errors
  }

  withRedirect(url: string): this {
    this.redirectTo = url
    return this
  }

  withInput(input: unknown): this {
    this.input = input
    return this
  }
}
