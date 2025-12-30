import type { GravitoContext } from 'gravito-core'
import { Sanitizer } from './Sanitizer'

export abstract class BaseController {
  protected sanitizer = new Sanitizer()

  async call(ctx: GravitoContext, method: string): Promise<Response> {
    const action = (this as any)[method] as Function
    if (typeof action !== 'function') {
      throw new Error(`Method ${method} not found on controller`)
    }

    const response = await action.apply(this, [ctx])
    return response
  }
}

export abstract class Controller {
  protected context!: GravitoContext

  /**
   * Set the request context for this controller instance.
   */
  public setContext(context: GravitoContext): this {
    this.context = context
    return this
  }

  /**
   * Return a JSON response.
   */
  protected json(data: any, status = 200) {
    // 透過 GravitoContext 的標準介面回傳
    return this.context.json(data, status as any)
  }

  /**
   * Return a text response.
   */
  protected text(text: string, status = 200) {
    return this.context.text(text, status as any)
  }

  /**
   * Redirect to a given URL.
   */
  protected redirect(url: string, status = 302) {
    return this.context.redirect(url, status as any)
  }

  /**
   * Get an item from the context variables.
   */
  protected get<T>(key: string): T {
    return this.context.get(key as any)
  }

  /**
   * Get the request object.
   */
  protected get request() {
    return this.context.req
  }

  /**
   * Validate the request against a schema.
   */
  protected async validate<T>(
    _schema: any,
    source: 'json' | 'query' | 'form' = 'json'
  ): Promise<T> {
    return (this.context.req as any).valid(source) as T
  }

  /**
   * Resolve a controller action into a Hono-compatible handler.
   */
  public static call<T extends Controller>(this: new () => T, method: keyof T): any {
    return async (c: GravitoContext) => {
      const instance = new this()
      instance.setContext(c)
      const action = instance[method] as unknown as Function
      return action.apply(instance, [c])
    }
  }
}
