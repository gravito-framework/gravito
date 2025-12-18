import { RobotsBuilder, type SeoConfig, SeoEngine, XmlStreamBuilder } from '@gravito/seo-core'
import type { Context, MiddlewareHandler } from 'hono'

export function gravitoSeo(config: SeoConfig): MiddlewareHandler {
  const engine = new SeoEngine(config)

  // Lazy init on first request or immediate?
  // Let's do lazy to avoid startup blocking, but we could add an option.
  let initialized = false

  return async (c: Context, _next) => {
    // Check if request is for sitemap
    // We assume this middleware is mounted on a specific path OR the user uses a wildcard mount.
    // If wildcard, we need to check path.
    // BUT typically user mounts it like: app.get('/sitemap.xml', gravitoSeo(c))
    // To support robots.txt, we should probably check the path if it's not explicitly matched?
    // Let's SUPPORT both explicit mount and "smart" mount.

    const path = c.req.path

    // Robots.txt Handler
    if (path.endsWith('/robots.txt')) {
      if (config.robots) {
        const robotsBuilder = new RobotsBuilder(config.robots, config.baseUrl)
        const content = robotsBuilder.build()
        return c.text(content)
      }
      // If config.robots is missing, maybe we shouldn't handle it?
      // Or return a default one allowing everything + sitemap?
      const defaultBuilder = new RobotsBuilder(
        {
          rules: [{ userAgent: '*', allow: ['/'] }],
        },
        config.baseUrl
      )
      return c.text(defaultBuilder.build())
    }

    // Sitemap Handler
    // For safety, only run sitemap logic if path ends in .xml OR user deliberately mounted this here.
    // We'll trust the mount point mostly, but let's be safe.

    if (!initialized) {
      try {
        await engine.init()
        initialized = true
      } catch (e) {
        console.error('[GravitoSeo] Init failed:', e)
        return c.text('Internal Server Error', 500)
      }
    }

    try {
      const strategy = engine.getStrategy()
      const entries = await strategy.getEntries()

      const builder = new XmlStreamBuilder({
        baseUrl: config.baseUrl,
        branding: config.branding?.enabled,
      })

      const xml = builder.buildFull(entries)

      c.header('Content-Type', 'application/xml')
      return c.body(xml)
    } catch (e) {
      console.error('[GravitoSeo] Middleware Error:', e)
      return c.text('Internal Server Error', 500)
    }
  }
}
