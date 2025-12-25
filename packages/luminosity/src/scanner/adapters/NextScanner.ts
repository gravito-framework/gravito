import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import type { RouteScanner, ScannedRoute } from '../types'
import { extractParams, isDynamicRoute, normalizePath } from '../utils'

/**
 * Options for NextScanner
 */
export interface NextScannerOptions {
  /** App directory path (default: ./app) */
  appDir?: string

  /** Pages directory path for legacy Page Router (default: ./pages) */
  pagesDir?: string

  /** Exclude certain route patterns from scanning */
  excludePatterns?: (string | RegExp)[]

  /** Only include routes matching these patterns */
  includePatterns?: (string | RegExp)[]

  /** Current working directory (default: process.cwd()) */
  cwd?: string
}

/**
 * NextScanner
 *
 * Scans routes from Next.js App Router file system.
 * Supports both App Router (app/) and Pages Router (pages/).
 *
 * @example
 * ```typescript
 * import { NextScanner, SitemapBuilder } from '@gravito/luminosity'
 *
 * const builder = new SitemapBuilder({
 *   scanner: new NextScanner({ appDir: './app' }),
 *   hostname: 'https://example.com'
 * })
 *
 * const entries = await builder.build()
 * ```
 */
export class NextScanner implements RouteScanner {
  readonly framework = 'next.js'

  constructor(private options: NextScannerOptions = {}) {}

  async scan(): Promise<ScannedRoute[]> {
    const routes: ScannedRoute[] = []
    const cwd = this.options.cwd ?? process.cwd()

    // Scan App Router (Next.js 13+)
    const appDir = join(cwd, this.options.appDir ?? 'app')
    if (this.dirExists(appDir)) {
      routes.push(...this.scanAppDir(appDir))
    }

    // Scan Pages Router (legacy)
    const pagesDir = join(cwd, this.options.pagesDir ?? 'pages')
    if (this.dirExists(pagesDir)) {
      routes.push(...this.scanPagesDir(pagesDir))
    }

    // Apply filters
    return routes.filter((route) => !this.shouldExclude(route.path))
  }

  /**
   * Scan Next.js App Router directory
   */
  private scanAppDir(dir: string, basePath = ''): ScannedRoute[] {
    const routes: ScannedRoute[] = []

    try {
      const entries = readdirSync(dir)

      for (const entry of entries) {
        // Skip hidden files and node_modules
        if (entry.startsWith('.') || entry === 'node_modules') {
          continue
        }

        const fullPath = join(dir, entry)
        const stat = statSync(fullPath)

        if (stat.isDirectory()) {
          // Route groups: (group) -> skip the group name but scan children
          if (entry.startsWith('(') && entry.endsWith(')')) {
            routes.push(...this.scanAppDir(fullPath, basePath))
            continue
          }

          // Dynamic segments: [slug] -> :slug
          // Catch-all segments: [...slug] -> *slug
          // Optional catch-all: [[...slug]] -> *slug
          let segment = entry
          if (entry.startsWith('[[...') && entry.endsWith(']]')) {
            segment = `:${entry.slice(5, -2)}*`
          } else if (entry.startsWith('[...') && entry.endsWith(']')) {
            segment = `:${entry.slice(4, -1)}*`
          } else if (entry.startsWith('[') && entry.endsWith(']')) {
            segment = `:${entry.slice(1, -1)}`
          }

          routes.push(...this.scanAppDir(fullPath, `${basePath}/${segment}`))
        } else if (this.isPageFile(entry)) {
          // page.tsx, page.ts, page.jsx, page.js
          const path = normalizePath(basePath || '/')
          routes.push({
            path,
            method: 'GET',
            isDynamic: isDynamicRoute(path),
            params: extractParams(path),
          })
        }
      }
    } catch {
      // Directory doesn't exist or can't be read
    }

    return routes
  }

  /**
   * Scan Next.js Pages Router directory
   */
  private scanPagesDir(dir: string, basePath = ''): ScannedRoute[] {
    const routes: ScannedRoute[] = []

    try {
      const entries = readdirSync(dir)

      for (const entry of entries) {
        // Skip hidden files, _app, _document, _error, api routes
        if (
          entry.startsWith('.') ||
          entry.startsWith('_') ||
          entry === 'api' ||
          entry === 'node_modules'
        ) {
          continue
        }

        const fullPath = join(dir, entry)
        const stat = statSync(fullPath)

        if (stat.isDirectory()) {
          // Dynamic segments: [slug] -> :slug
          let segment = entry
          if (entry.startsWith('[') && entry.endsWith(']')) {
            segment = `:${entry.slice(1, -1)}`
          }

          routes.push(...this.scanPagesDir(fullPath, `${basePath}/${segment}`))
        } else if (this.isPageFile(entry)) {
          const name = entry.replace(/\.(tsx|ts|jsx|js)$/, '')
          let path: string

          if (name === 'index') {
            path = basePath || '/'
          } else if (name.startsWith('[') && name.endsWith(']')) {
            path = `${basePath}/:${name.slice(1, -1)}`
          } else {
            path = `${basePath}/${name}`
          }

          path = normalizePath(path)

          routes.push({
            path,
            method: 'GET',
            isDynamic: isDynamicRoute(path),
            params: extractParams(path),
          })
        }
      }
    } catch {
      // Directory doesn't exist or can't be read
    }

    return routes
  }

  private isPageFile(filename: string): boolean {
    return /^page\.(tsx|ts|jsx|js)$/.test(filename) || /\.(tsx|ts|jsx|js)$/.test(filename)
  }

  private dirExists(path: string): boolean {
    try {
      return statSync(path).isDirectory()
    } catch {
      return false
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
