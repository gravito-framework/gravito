import type { RouteScanner, ScannedRoute } from '../types'
import { extractParams, isDynamicRoute } from '../utils'

/**
 * Options for HonoScanner
 */
export interface HonoScannerOptions {
  /** Exclude certain route patterns from scanning */
  excludePatterns?: (string | RegExp)[]

  /** Only include routes matching these patterns */
  includePatterns?: (string | RegExp)[]
}

/**
 * Route information from Hono's routes property
 */
interface HonoRouteInfo {
  method: string
  path: string
  handler?: unknown
}

/**
 * Hono-like interface for duck typing
 */
interface HonoLike {
  routes: HonoRouteInfo[]
}

/**
 * HonoScanner
 *
 * Scans routes registered in a Hono application.
 * Works with Hono v3 and v4.
 *
 * @example
 * ```typescript
 * import { Hono } from 'hono'
 * import { HonoScanner, SitemapBuilder } from '@gravito/luminosity'
 *
 * const app = new Hono()
 * app.get('/hello', (c) => c.text('Hello'))
 * app.get('/blog/:slug', (c) => c.text('Blog'))
 *
 * const builder = new SitemapBuilder({
 *   scanner: new HonoScanner(app),
 *   hostname: 'https://example.com'
 * })
 *
 * const entries = await builder.build()
 * ```
 */
export class HonoScanner implements RouteScanner {
  readonly framework = 'hono'

  constructor(
    private app: HonoLike,
    private options: HonoScannerOptions = {}
  ) {}

  async scan(): Promise<ScannedRoute[]> {
    const routes: ScannedRoute[] = []

    // Hono exposes app.routes property
    for (const route of this.app.routes) {
      const path = route.path

      // Apply include/exclude filters
      if (this.shouldExclude(path)) {
        continue
      }

      routes.push({
        path,
        method: this.normalizeMethod(route.method),
        isDynamic: isDynamicRoute(path),
        params: extractParams(path),
      })
    }

    return routes
  }

  private normalizeMethod(method: string): ScannedRoute['method'] {
    const upper = method.toUpperCase()
    switch (upper) {
      case 'GET':
      case 'POST':
      case 'PUT':
      case 'DELETE':
      case 'PATCH':
        return upper
      default:
        return 'ALL'
    }
  }

  private shouldExclude(path: string): boolean {
    // Check exclude patterns
    if (this.options.excludePatterns?.length) {
      for (const pattern of this.options.excludePatterns) {
        if (typeof pattern === 'string' && path.includes(pattern)) {
          return true
        }
        if (pattern instanceof RegExp && pattern.test(path)) {
          return true
        }
      }
    }

    // Check include patterns (if specified, must match at least one)
    if (this.options.includePatterns?.length) {
      let matched = false
      for (const pattern of this.options.includePatterns) {
        if (typeof pattern === 'string' && path.includes(pattern)) {
          matched = true
          break
        }
        if (pattern instanceof RegExp && pattern.test(path)) {
          matched = true
          break
        }
      }
      return !matched
    }

    return false
  }
}
