import { OrbitCache } from '@gravito/orbit-cache'
import { OrbitView } from '@gravito/orbit-view'
import { defineConfig, PlanetCore } from 'gravito-core'
import { registerHooks } from './hooks'
import { createApp } from './app'

export interface AppConfig {
  port?: number
  name?: string
  version?: string
}

/**
 * Bootstrap the Gravito application
 *
 * This function handles all the boilerplate:
 * - Configuration
 * - Orbit loading (Cache, etc.)
 * - Route registration using app.route() for type inference
 * - Hook registration
 *
 * 重要：此應用程式使用 app.route() 方法來串接路由模組，
 * 這是為了獲得完整 TypeScript 型別推導的必要寫法。
 *
 * @example
 * ```ts
 * export default await bootstrap({
 *   port: 3000,
 *   name: 'My App',
 * })
 * ```
 */
export async function bootstrap(options: AppConfig = {}) {
  const { port = 3000, name = 'Gravito App', version = '1.0.0' } = options

  // 1. Configure
  const config = defineConfig({
    config: {
      PORT: port,
      APP_NAME: name,
      APP_VERSION: version,
      VIEW_DIR: 'src/views', // Optional, defaults to src/views
    },
    orbits: [OrbitCache, OrbitView],
  })

  // 2. Boot
  const core = await PlanetCore.boot(config)
  core.registerGlobalErrorHandlers()

  // 3. Hooks
  registerHooks(core)

  // 4. Create app with route modules
  // 使用 app.route() 方法來串接路由模組，以獲得完整的型別推導
  const { app } = createApp(core)

  // 5. Mount app to core
  // 將建立的 app 掛載到 core.app 上
  core.app = app

  // 6. Liftoff!
  return core.liftoff()
}
