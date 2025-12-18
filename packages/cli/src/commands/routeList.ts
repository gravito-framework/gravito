import path from 'node:path'
import pc from 'picocolors'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

type HonoRouteLike = { method: string; path: string; name?: string }
type HonoAppLike = { routes: HonoRouteLike[] }

function isHonoAppLike(value: unknown): value is HonoAppLike {
  return (
    isRecord(value) &&
    Array.isArray(value.routes) &&
    value.routes.every(
      (r) =>
        isRecord(r) &&
        typeof r.method === 'string' &&
        typeof r.path === 'string' &&
        (r.name === undefined || typeof r.name === 'string')
    )
  )
}

export async function routeList(options: { entry: string }) {
  try {
    const cwd = process.cwd()
    const entryPath = path.resolve(cwd, options.entry)

    // Import the app
    const module = await import(entryPath)
    // Try to find the Hono app instance
    // Standard pattern: import { app } from './index' or default export
    // Gravito Core usually wraps it. core.app is the Hono instance.

    const mod = isRecord(module) ? module : {}
    const defaultExport = isRecord(mod.default) ? mod.default : undefined
    const coreCandidate = defaultExport?.core ?? mod.core
    const core = isRecord(coreCandidate) ? coreCandidate : undefined

    const routerCandidate = core?.router
    const exportNamedRoutes =
      isRecord(routerCandidate) && typeof routerCandidate.exportNamedRoutes === 'function'
        ? (routerCandidate.exportNamedRoutes as () => Record<
            string,
            { method: string; path: string; domain?: string }
          >)
        : null

    const namedRoutes = exportNamedRoutes ? exportNamedRoutes() : {}

    const nameBySignature = new Map<string, string>()
    for (const [name, def] of Object.entries(namedRoutes)) {
      nameBySignature.set(`${def.method} ${def.path}`, name)
    }

    const appCandidate = core?.app ?? defaultExport ?? mod.app
    const honoApp: HonoAppLike | null = isHonoAppLike(appCandidate) ? appCandidate : null

    if (!honoApp) {
      throw new Error('Could not look up Hono app instance in entry file.')
    }

    console.log(pc.bold(`\n📍 Registered Routes`))
    console.log(
      pc.gray('--------------------------------------------------------------------------------')
    )
    console.log(pc.bold('METHOD'.padEnd(10)) + pc.bold('PATH'.padEnd(40)) + pc.bold('NAME/HANDLER'))
    console.log(
      pc.gray('--------------------------------------------------------------------------------')
    )

    // Hono .routes is an array of objects
    // route structure: { method: string, path: string, handler: Function, name?: string }
    for (const route of honoApp.routes) {
      const method = route.method
      const pathStr = route.path
      const name = route.name || nameBySignature.get(`${method} ${pathStr}`) || '-'

      // Colorize method
      let methodColored = method
      switch (method) {
        case 'GET':
          methodColored = pc.cyan(method)
          break
        case 'POST':
          methodColored = pc.yellow(method)
          break
        case 'PUT':
          methodColored = pc.blue(method)
          break
        case 'DELETE':
          methodColored = pc.red(method)
          break
        case 'PATCH':
          methodColored = pc.magenta(method)
          break
      }

      console.log(
        methodColored.padEnd(19) + // extra padding for ansi codes? No, manual padding might be tricky with colors
          pathStr.padEnd(40) +
          name
      )
    }
    console.log('')
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error(pc.red(`Failed to list routes: ${message}`))
    process.exit(1)
  }
}
