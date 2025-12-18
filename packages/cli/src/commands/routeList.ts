import path from 'node:path'
import pc from 'picocolors'

export async function routeList(options: { entry: string }) {
    try {
        const cwd = process.cwd()
        const entryPath = path.resolve(cwd, options.entry)

        // Import the app
        const module = await import(entryPath)
        // Try to find the Hono app instance
        // Standard pattern: import { app } from './index' or default export
        // Gravito Core usually wraps it. core.app is the Hono instance.

        let honoApp: any = null
        const core = module.default?.core || module.core

        if (core && core.app) {
            honoApp = core.app
        } else if (module.default && module.default.routes) {
            // Maybe default export is the Hono app
            honoApp = module.default
        } else if (module.app && module.app.routes) {
            honoApp = module.app
        }

        if (!honoApp) {
            throw new Error('Could not look up Hono app instance in entry file.')
        }

        console.log(pc.bold(`\n📍 Registered Routes`))
        console.log(pc.gray('--------------------------------------------------------------------------------'))
        console.log(
            pc.bold('METHOD'.padEnd(10)) +
            pc.bold('PATH'.padEnd(40)) +
            pc.bold('NAME/HANDLER')
        )
        console.log(pc.gray('--------------------------------------------------------------------------------'))

        // Hono .routes is an array of objects
        // route structure: { method: string, path: string, handler: Function, name?: string }
        for (const route of honoApp.routes) {
            const method = route.method
            const pathStr = route.path
            let name = route.name || '-'

            // Colorize method
            let methodColored = method
            switch (method) {
                case 'GET': methodColored = pc.cyan(method); break;
                case 'POST': methodColored = pc.yellow(method); break;
                case 'PUT': methodColored = pc.blue(method); break;
                case 'DELETE': methodColored = pc.red(method); break;
                case 'PATCH': methodColored = pc.magenta(method); break;
            }

            console.log(
                methodColored.padEnd(19) + // extra padding for ansi codes? No, manual padding might be tricky with colors
                pathStr.padEnd(40) +
                name
            )
        }
        console.log('')

    } catch (err: any) {
        console.error(pc.red(`Failed to list routes: ${err.message}`))
        process.exit(1)
    }
}
