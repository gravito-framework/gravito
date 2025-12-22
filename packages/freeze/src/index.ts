/**
 * @gravito/freeze
 *
 * Static Site Generation (SSG) core module for Gravito Framework.
 *
 * This package provides the core utilities for building static sites
 * from Gravito applications. It handles:
 *
 * - Environment detection (static vs dynamic)
 * - Locale-aware routing
 * - Redirect generation
 * - Sitemap generation with i18n alternates
 *
 * @example
 * ```typescript
 * import { defineConfig, createDetector } from '@gravito/freeze'
 *
 * const config = defineConfig({
 *   staticDomains: ['example.com'],
 *   locales: ['en', 'zh'],
 *   defaultLocale: 'en',
 *   baseUrl: 'https://example.com',
 * })
 *
 * const detector = createDetector(config)
 *
 * if (detector.isStaticSite()) {
 *   // Use native <a> tags
 * } else {
 *   // Use Inertia <Link>
 * }
 * ```
 *
 * @packageDocumentation
 */

export type { SitemapEntry } from './builder'
// Build Utilities
export {
  generateLocalizedRoutes,
  generateRedirectHtml,
  generateRedirects,
  generateSitemapEntries,
  inferRedirects,
} from './builder'
export type { FreezeConfig, RedirectRule } from './config'
// Configuration
export { defaultConfig, defineConfig } from './config'
export type { RedirectInfo } from './detector'
// Runtime Detection
export { createDetector, FreezeDetector } from './detector'
