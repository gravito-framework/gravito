import { describe, expect, it } from 'bun:test'

// Note: Full React component tests require jsdom or similar
// These are basic module-level tests

describe('@gravito/freeze-react', () => {
  it('should export all expected functions', async () => {
    const module = await import('../src')

    // Core re-exports
    expect(typeof module.defineConfig).toBe('function')
    expect(typeof module.createDetector).toBe('function')
    expect(typeof module.generateRedirectHtml).toBe('function')
    expect(typeof module.generateRedirects).toBe('function')
    expect(typeof module.generateLocalizedRoutes).toBe('function')
    expect(typeof module.inferRedirects).toBe('function')
    expect(typeof module.generateSitemapEntries).toBe('function')

    // React components
    expect(typeof module.FreezeProvider).toBe('function')
    expect(typeof module.StaticLink).toBe('function')
    expect(typeof module.LocaleSwitcher).toBe('function')

    // React hooks
    expect(typeof module.useFreeze).toBe('function')
  })

  it('should re-export defineConfig correctly', async () => {
    const { defineConfig } = await import('../src')

    const config = defineConfig({
      staticDomains: ['example.com'],
      locales: ['en', 'zh'],
      defaultLocale: 'en',
      baseUrl: 'https://example.com',
    })

    expect(config.staticDomains).toEqual(['example.com'])
    expect(config.locales).toEqual(['en', 'zh'])
    expect(config.defaultLocale).toBe('en')
    expect(config.previewPort).toBe(4173) // default
  })

  it('should re-export createDetector correctly', async () => {
    const { createDetector, defineConfig } = await import('../src')

    const config = defineConfig({
      staticDomains: ['example.com'],
      locales: ['en', 'zh'],
      defaultLocale: 'en',
      baseUrl: 'https://example.com',
    })

    const detector = createDetector(config)

    expect(typeof detector.isStaticSite).toBe('function')
    expect(typeof detector.getLocalizedPath).toBe('function')
    expect(typeof detector.switchLocale).toBe('function')
  })
})
