import { bodySizeLimit, defineConfig, PlanetCore, securityHeaders } from 'gravito-core'
import { registerRoutes } from './routes'

const DEFAULT_PORT = Number(process.env.PORT ?? '3001')

export async function bootstrap() {
  const config = defineConfig({
    config: {
      PORT: DEFAULT_PORT,
      APP_NAME: process.env.APP_NAME ?? 'Gravito Workflow Demo',
      APP_VERSION: process.env.APP_VERSION ?? '0.1.0',
      VIEW_DIR: 'src/views',
    },
    orbits: [],
  })

  const core = await PlanetCore.boot(config)
  core.registerGlobalErrorHandlers()

  const defaultCsp =
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"
  core.adapter.use(
    '*',
    securityHeaders({
      contentSecurityPolicy: process.env.APP_CSP === 'false' ? false : defaultCsp,
      hsts:
        process.env.NODE_ENV === 'production'
          ? { maxAge: 15552000, includeSubDomains: true }
          : false,
    })
  )

  const limit = Number(process.env.APP_BODY_LIMIT ?? '1048576')
  if (limit > 0) {
    core.adapter.use('*', bodySizeLimit(limit))
  }

  registerRoutes(core)

  return core
}
