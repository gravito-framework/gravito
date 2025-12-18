import fs from 'node:fs/promises'
import path from 'node:path'
import { cancel, intro, isCancel, note, outro, select, spinner, text } from '@clack/prompts'
import cac from 'cac'
import { downloadTemplate } from 'giget'
import pc from 'picocolors'

interface ProjectConfig {
  name: string
  template: string
  [key: string]: unknown
}

const cli = cac('gravito')

cli
  .command('schedule:run', 'Run due scheduled tasks')
  .option('--entry <file>', 'Entry file (default: src/index.ts)', { default: 'src/index.ts' })
  .action(async (options) => {
    try {
      const entryPath = path.resolve(process.cwd(), options.entry)
      // Dynamic import of the project entry file
      const app = await import(entryPath)

      const core = app.default?.core

      if (!core) {
        console.error(
          pc.red('❌ Could not find Gravito PlanetCore instance in entry file exports.')
        )
        console.error(
          pc.gray('Ensure your src/index.ts exports the result of bootstrap() or core.liftoff()')
        )
        process.exit(1)
      }

      const scheduler = core.services.get('scheduler')
      if (!scheduler) {
        console.error(pc.yellow('⚠️ Orbit Scheduler is not installed in this planet.'))
        process.exit(1)
      }

      await scheduler.run()

      process.exit(0)
    } catch (err) {
      console.error(pc.red('Failed to run scheduler:'), err)
      process.exit(1)
    }
  })

cli
  .command('schedule:work', 'Run scheduler in daemon mode')
  .option('--entry <file>', 'Entry file (default: src/index.ts)', { default: 'src/index.ts' })
  .action(async (options) => {
    try {
      const entryPath = path.resolve(process.cwd(), options.entry)
      const app = await import(entryPath)
      const core = app.default?.core

      if (!core) {
        console.error(pc.red('❌ Could not find Gravito PlanetCore instance.'))
        process.exit(1)
      }

      const scheduler = core.services.get('scheduler')
      if (!scheduler) {
        console.error(pc.yellow('⚠️ Orbit Scheduler is not installed.'))
        process.exit(1)
      }

      console.log(pc.green('🕐 Scheduler worker started'))

      const run = async () => {
        try {
          await scheduler.run()
        } catch (e) {
          console.error(pc.red('Error running schedule:'), e)
        }
      }

      // Basic loop
      while (true) {
        const now = new Date()
        const seconds = now.getSeconds()
        const delay = (60 - seconds) * 1000

        // Align to next minute
        await new Promise((resolve) => setTimeout(resolve, delay))
        await run()
      }
    } catch (err) {
      console.error(pc.red('Failed to start worker:'), err)
      process.exit(1)
    }
  })

cli
  .command('schedule:list', 'List scheduled tasks')
  .option('--entry <file>', 'Entry file (default: src/index.ts)', { default: 'src/index.ts' })
  .action(async (options) => {
    try {
      const entryPath = path.resolve(process.cwd(), options.entry)
      const app = await import(entryPath)
      const core = app.default?.core

      if (!core) {
        console.error(pc.red('❌ Could not find Gravito PlanetCore instance.'))
        process.exit(1)
      }

      const scheduler = core.services.get('scheduler')
      if (!scheduler) {
        console.error(pc.yellow('⚠️ Orbit Scheduler is not installed.'))
        process.exit(1)
      }

      const tasks = scheduler.getTasks()

      console.log(pc.bold(`\n📅 Scheduled Tasks (${tasks.length})`))
      console.log(pc.gray('--------------------------------------------------'))

      if (tasks.length === 0) {
        console.log('No tasks scheduled.')
        process.exit(0)
      }

      console.log(
        `${pc.bold('Name'.padEnd(20))} ${pc.bold('Expression'.padEnd(15))} ${pc.bold('Timezone')}`
      )
      console.log(pc.gray('--------------------------------------------------'))

      for (const task of tasks) {
        console.log(
          `${pc.cyan(task.name.padEnd(20))} ${pc.yellow(task.expression.padEnd(15))} ${task.timezone}`
        )
      }
      console.log('')
      process.exit(0)
    } catch (err) {
      console.error(pc.red('Failed to list tasks:'), err)
      process.exit(1)
    }
  })

cli.command('create [name]', 'Create a new Gravito project').action(async (name) => {
  console.clear()

  intro(pc.bgBlack(pc.white(' 🌌 Gravito CLI ')))

  const project = await group<ProjectConfig>({
    name: () => {
      if (name) {
        return Promise.resolve(name)
      }
      return text({
        message: 'What is the name of your new universe?',
        placeholder: 'my-galaxy-app',
        defaultValue: 'my-galaxy-app',
        validate: (value) => {
          if (value.length === 0) {
            return 'Name is required!'
          }
          if (/[^a-z0-9-_]/.test(value)) {
            return 'Name should only contain lowercase letters, numbers, dashes, and underscores.'
          }
          return
        },
      })
    },
    template: () =>
      select({
        message: 'Pick a starting point:',
        options: [
          { value: 'basic', label: '🪐 Basic Planet (Core + Hono)', hint: 'Minimal setup' },
          { value: 'inertia-react', label: '⚛️ Inertia + React', hint: 'Full-stack SPA with Vite' },
        ],
      }),
  })

  if (isCancel(project.name) || isCancel(project.template)) {
    cancel('Operation cancelled.')
    process.exit(0)
  }

  const s = spinner()
  s.start('Scaffolding your universe...')

  try {
    // Use giget to download from GitHub
    // Format: github:user/repo/path/to/template
    // We point to the 'templates/basic' folder in our repo
    const templateSource = `github:CarlLee1983/gravito/templates/${project.template}#main`

    await downloadTemplate(templateSource, {
      dir: project.name,
      force: true, // Allow overwriting empty dir
    })

    s.stop('Universe created!')

    // Update package.json
    const pkgPath = path.join(process.cwd(), project.name, 'package.json')
    const pkg = JSON.parse(await fs.readFile(pkgPath, 'utf-8'))

    // Update project name
    pkg.name = project.name

    // Replace workspace:* with actual versions
    const gravitoVersion = '^0.3.0'
    if (pkg.dependencies) {
      for (const dep of Object.keys(pkg.dependencies)) {
        if (pkg.dependencies[dep] === 'workspace:*') {
          pkg.dependencies[dep] = gravitoVersion
        }
      }
    }

    await fs.writeFile(pkgPath, JSON.stringify(pkg, null, 2))

    note(`Project: ${project.name}\nTemplate: ${project.template}`, 'Mission Successful')

    outro(`You're all set! \n\n  cd ${pc.cyan(project.name)}\n  bun install\n  bun run dev`)
  } catch (err: unknown) {
    s.stop('Mission Failed')
    const message = err instanceof Error ? err.message : String(err)
    console.error(pc.red(message))
    process.exit(1)
  }
})

async function group<T extends Record<string, unknown>>(
  prompts: Record<string, () => Promise<unknown>>
): Promise<T> {
  const results: Record<string, unknown> = {}

  for (const key of Object.keys(prompts)) {
    const promptFn = prompts[key]
    if (!promptFn) continue
    const result = await promptFn()

    if (isCancel(result)) {
      cancel('Operation cancelled.')
      process.exit(0)
    }

    results[key] = result
  }

  return results as T
}

cli.help()
cli.version('0.3.0-alpha.1')

try {
  cli.parse()
} catch (error) {
  console.error(error)
  process.exit(1)
}
