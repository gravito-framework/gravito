import { OrbitIon } from '@gravito/ion'
import { OrbitPrism } from '@gravito/prism'
import { defineConfig, GravitoAdapter, PlanetCore } from 'gravito-core'
import { serveStatic } from 'hono/bun'

// Simple bootstrap for the marketing site
const config = defineConfig({
  config: {
    APP_NAME: 'Luminosity',
    PORT: 3000,
    VIEW_DIR: 'src/views',
  },
  orbits: [OrbitIon, OrbitPrism],
  adapter: new GravitoAdapter(),
})

const core = await PlanetCore.boot(config)

// Static assets
const app = core.app as any
app.use('/static/*', serveStatic({ root: './' }))

// Basic route
core.router.get('/', (c) => {
  // In a real implementation, this would render the React page
  return c.text('🌌 Luminosity Marketing Site - Coming Soon')
})

export default core.liftoff()
