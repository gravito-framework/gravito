import type { GravitoContext, GravitoMiddleware } from '../types'

export type BodySizeLimitOptions = {
  methods?: string[]
}

const defaultMethods = ['POST', 'PUT', 'PATCH', 'DELETE']

export function bodySizeLimit(
  maxBytes: number,
  options: BodySizeLimitOptions = {}
): GravitoMiddleware {
  const allowedMethods = (options.methods ?? defaultMethods).map((m) => m.toUpperCase())

  return async (c, next) => {
    const method = c.req.method.toUpperCase()
    if (!allowedMethods.includes(method)) {
      await next()
      return undefined
    }

    const lengthHeader = c.req.header('Content-Length')
    if (lengthHeader) {
      const length = Number(lengthHeader)
      if (!Number.isNaN(length) && length > maxBytes) {
        return c.text('Payload Too Large', 413)
      }
    }

    await next()
    return undefined
  }
}
