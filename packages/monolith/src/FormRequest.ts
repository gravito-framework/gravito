import { type TSchema, validate } from '@gravito/mass'
import type { GravitoContext, GravitoNext } from 'gravito-core'
import { Sanitizer } from './Sanitizer.js'

export abstract class FormRequest {
  protected context!: GravitoContext

  /**
   * Define the validation schema.
   */
  abstract schema(): TSchema

  /**
   * Define the source of data (json, query, form, etc.).
   */
  source(): 'json' | 'query' | 'form' {
    return 'json'
  }

  /**
   * Determine if the user is authorized to make this request.
   */
  authorize(): boolean {
    return true
  }

  /**
   * Set the context.
   */
  public setContext(context: GravitoContext): this {
    this.context = context
    return this
  }

  /**
   * Get the validated data.
   */
  public validated(): any {
    const data = (this.context.req as any).valid(this.source())
    return Sanitizer.clean(data)
  }

  /**
   * Static helper to create a middleware from this request class.
   */
  public static middleware(): any {
    const RequestClass = this as any

    return async (c: GravitoContext, next: GravitoNext) => {
      const instance = new RequestClass()
      instance.setContext(c)

      // 1. Authorization Check
      if (!instance.authorize()) {
        return c.json({ message: 'This action is unauthorized.' }, 403)
      }

      // 2. Validation using mass
      // Note: We cast 'c' as any because mass expects a native Hono Context,
      // but we use our compatible GravitoContext wrapper.
      const validator = validate(instance.source(), instance.schema(), (result: any, ctx: any) => {
        if (!result.success) {
          const errors: Record<string, string[]> = {}
          const issues = result.error?.issues || []

          for (const issue of issues) {
            const path = Array.isArray(issue.path) ? issue.path.join('.') : issue.path || 'root'
            const key = path.replace(/^\//, '').replace(/\//g, '.')
            if (!errors[key]) errors[key] = []
            errors[key].push(issue.message || 'Validation failed')
          }

          return ctx.json(
            {
              message: 'The given data was invalid.',
              errors: Object.keys(errors).length > 0 ? errors : { root: ['Validation failed'] },
            },
            422
          )
        }
      })

      return validator(c as any, next as any)
    }
  }
}
