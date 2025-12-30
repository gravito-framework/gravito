import { FluxEngine, JsonFileTraceSink, MemoryStorage } from '@gravito/flux'
import { env } from './env'
import { orderWorkflow } from './workflows/order'

export interface FluxEngineOptions {
  tracePath?: string
  resetTrace?: boolean
}

export function createFluxEngine(options?: FluxEngineOptions) {
  const tracePath = options?.tracePath ?? env.tracePath
  const sink = new JsonFileTraceSink({ path: tracePath, reset: options?.resetTrace ?? true })

  return new FluxEngine({ storage: new MemoryStorage(), trace: sink })
}

export { orderWorkflow }
export const traceLocation = env.tracePath
