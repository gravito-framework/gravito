import { describe, expect, it } from 'bun:test'

// Note: Full Vue component tests require jsdom or similar
// These are basic module-level tests

describe('@gravito/freeze-vue', () => {
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

    // Vue components
    expect(module.StaticLink).toBeDefined()
    expect(module.LocaleSwitcher).toBeDefined()

    // Vue plugin
    expect(module.FreezePlugin).toBeDefined()
    expect(typeof module.FreezePlugin.install).toBe('function')

    // Vue composables
    expect(typeof module.useFreeze).toBe('function')
    expect(typeof module.provideFreeze).toBe('function')

    // Injection key
    expect(module.FREEZE_KEY).toBeDefined()
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

  it('should have FreezePlugin with install method', async () => {
    const { FreezePlugin, defineConfig } = await import('../src')

    expect(FreezePlugin).toHaveProperty('install')
    expect(typeof FreezePlugin.install).toBe('function')
  })
})
