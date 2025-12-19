declare module '@gravito/orbit-inertia' {
  import { Context, Next } from 'hono'
  import { GravitoOrbit, PlanetCore } from 'gravito-core'

  export interface InertiaConfig {
    rootView?: string
    version?: string
  }

  export class InertiaService {
    constructor(c: Context, config?: InertiaConfig)
    render(component: string, props?: Record<string, unknown>): Response | Promise<Response>
    share(key: string, value: unknown): void
  }

  export class OrbitInertia implements GravitoOrbit {
    install(core: PlanetCore): void
  }
}
