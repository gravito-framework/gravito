import { describe, expect, it } from 'bun:test'
import {
  createDetector,
  defineConfig,
  generateLocalizedRoutes,
  generateRedirectHtml,
  generateRedirects,
  inferRedirects,
} from '../src'

describe('@gravito/freeze', () => {
  describe('defineConfig', () => {
    it('should merge with defaults', () => {
      const config = defineConfig({
        staticDomains: ['example.com'],
        baseUrl: 'https://example.com',
      })

      expect(config.staticDomains).toEqual(['example.com'])
      expect(config.previewPort).toBe(4173)
      expect(config.defaultLocale).toBe('en')
      expect(config.outputDir).toBe('dist-static')
    })

    it('should allow overriding defaults', () => {
      const config = defineConfig({
        staticDomains: ['example.com'],
        baseUrl: 'https://example.com',
        previewPort: 5000,
        defaultLocale: 'zh',
      })

      expect(config.previewPort).toBe(5000)
      expect(config.defaultLocale).toBe('zh')
    })
  })

  describe('FreezeDetector', () => {
    const config = defineConfig({
      staticDomains: ['example.com', 'example.github.io'],
      locales: ['en', 'zh'],
      defaultLocale: 'en',
      baseUrl: 'https://example.com',
      redirects: [
        { from: '/docs', to: '/en/docs/guide/getting-started' },
        { from: '/about', to: '/en/about' },
      ],
    })
    const detector = createDetector(config)

    describe('getLocaleFromPath', () => {
      it('should extract locale from path', () => {
        expect(detector.getLocaleFromPath('/en/docs')).toBe('en')
        expect(detector.getLocaleFromPath('/zh/about')).toBe('zh')
        expect(detector.getLocaleFromPath('/en')).toBe('en')
        expect(detector.getLocaleFromPath('/zh')).toBe('zh')
      })

      it('should return default locale for paths without locale', () => {
        expect(detector.getLocaleFromPath('/docs')).toBe('en')
        expect(detector.getLocaleFromPath('/')).toBe('en')
      })
    })

    describe('getLocalizedPath', () => {
      it('should add locale prefix', () => {
        expect(detector.getLocalizedPath('/about', 'en')).toBe('/en/about')
        expect(detector.getLocalizedPath('/docs/guide', 'zh')).toBe('/zh/docs/guide')
      })

      it('should handle root path', () => {
        expect(detector.getLocalizedPath('/', 'en')).toBe('/en')
        expect(detector.getLocalizedPath('/', 'zh')).toBe('/zh')
      })

      it('should replace existing locale prefix', () => {
        expect(detector.getLocalizedPath('/en/docs', 'zh')).toBe('/zh/docs')
        expect(detector.getLocalizedPath('/zh/about', 'en')).toBe('/en/about')
      })
    })

    describe('switchLocale', () => {
      it('should switch locale while preserving path', () => {
        expect(detector.switchLocale('/en/docs/guide', 'zh')).toBe('/zh/docs/guide')
        expect(detector.switchLocale('/zh/about', 'en')).toBe('/en/about')
      })

      it('should handle root locale paths', () => {
        expect(detector.switchLocale('/en', 'zh')).toBe('/zh/')
        expect(detector.switchLocale('/zh/', 'en')).toBe('/en/')
      })
    })

    describe('needsRedirect', () => {
      it('should detect redirect rules', () => {
        const redirect = detector.needsRedirect('/docs')
        expect(redirect).not.toBeNull()
        expect(redirect?.to).toBe('/en/docs/guide/getting-started')
      })

      it('should return null for non-redirect paths', () => {
        expect(detector.needsRedirect('/en/docs')).toBeNull()
        expect(detector.needsRedirect('/random')).toBeNull()
      })
    })
  })

  describe('generateRedirectHtml', () => {
    it('should generate valid redirect HTML', () => {
      const html = generateRedirectHtml('/en/about')

      expect(html).toContain('http-equiv="refresh"')
      expect(html).toContain('url=/en/about')
      expect(html).toContain("window.location.href='/en/about'")
      expect(html).toContain('href="/en/about"')
    })
  })

  describe('generateRedirects', () => {
    it('should generate redirect map', () => {
      const config = defineConfig({
        staticDomains: [],
        baseUrl: 'https://example.com',
        redirects: [
          { from: '/docs', to: '/en/docs' },
          { from: '/about', to: '/en/about' },
        ],
      })

      const redirects = generateRedirects(config)

      expect(redirects.size).toBe(2)
      expect(redirects.has('docs/index.html')).toBe(true)
      expect(redirects.has('about/index.html')).toBe(true)
    })
  })

  describe('generateLocalizedRoutes', () => {
    it('should generate localized routes', () => {
      const routes = generateLocalizedRoutes(['/docs', '/about'], ['en', 'zh'])

      expect(routes).toContain('/en/docs')
      expect(routes).toContain('/zh/docs')
      expect(routes).toContain('/en/about')
      expect(routes).toContain('/zh/about')
      expect(routes.length).toBe(4)
    })

    it('should handle root path', () => {
      const routes = generateLocalizedRoutes(['/'], ['en', 'zh'])

      expect(routes).toContain('/en')
      expect(routes).toContain('/zh')
    })
  })

  describe('inferRedirects', () => {
    it('should infer redirects from common routes', () => {
      const redirects = inferRedirects(['en', 'zh'], 'en', ['/docs', '/about'])

      expect(redirects).toEqual([
        { from: '/docs', to: '/en/docs' },
        { from: '/about', to: '/en/about' },
      ])
    })
  })
})
