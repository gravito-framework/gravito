import fs from 'node:fs/promises'
import path from 'node:path'
import pc from 'picocolors'
import { DrizzleMigrationDriver, type MigrationResult } from './DrizzleMigrationDriver'

/**
 * Generate a new migration file
 */
export async function makeMigration(name: string) {
  const driver = new DrizzleMigrationDriver()
  const result = await driver.generate(name)

  if (result.success) {
    console.log(pc.green(`✅ ${result.message}`))
  } else {
    console.error(pc.red(`❌ ${result.error}`))
    process.exit(1)
  }
}

/**
 * Run pending migrations
 */
export async function migrate(options: { fresh?: boolean }) {
  console.log(pc.cyan('🔄 Running migrations...'))

  const driver = new DrizzleMigrationDriver()

  let result: MigrationResult
  if (options.fresh) {
    console.log(pc.yellow('⚠️ Fresh migration: dropping all tables...'))
    result = await driver.fresh()
  } else {
    result = await driver.migrate()
  }

  if (result.success) {
    console.log(pc.green(`✅ ${result.message}`))
  } else {
    console.error(pc.red(`❌ ${result.message}`))
    if (result.error) {
      console.error(pc.gray(result.error))
    }
    process.exit(1)
  }
}

/**
 * Show migration status
 */
export async function migrateStatus() {
  const driver = new DrizzleMigrationDriver()
  const status = await driver.status()

  console.log(pc.bold('\n📋 Migration Status'))
  console.log(pc.gray('─'.repeat(40)))

  if (status.applied.length === 0) {
    console.log(pc.yellow('No migrations found.'))
  } else {
    console.log(pc.bold('Applied Migrations:'))
    for (const m of status.applied) {
      console.log(pc.green(`  ✓ ${m}`))
    }
  }

  if (status.pending.length > 0) {
    console.log(pc.bold('\nPending Migrations:'))
    for (const m of status.pending) {
      console.log(pc.yellow(`  ○ ${m}`))
    }
  }

  console.log('')
}

/**
 * Run database seeders
 */
export async function dbSeed(options: { class?: string }) {
  console.log(pc.cyan('🌱 Running seeders...'))

  const seedersDir = path.join(process.cwd(), 'src/database/seeders')

  try {
    // Check if directory exists
    await fs.access(seedersDir)

    // Get seeder files
    const files = await fs.readdir(seedersDir)
    const seeders = files.filter((f) => f.endsWith('.ts'))

    if (options.class) {
      // Run specific seeder
      const seederFile = seeders.find((f) => f.includes(options.class!))
      if (!seederFile) {
        console.error(pc.red(`❌ Seeder not found: ${options.class}`))
        process.exit(1)
      }
      await runSeeder(path.join(seedersDir, seederFile))
    } else {
      // Run all seeders
      for (const seeder of seeders) {
        await runSeeder(path.join(seedersDir, seeder))
      }
    }

    console.log(pc.green('✅ Seeding complete'))
  } catch (err: any) {
    if (err.code === 'ENOENT') {
      console.log(pc.yellow('No seeders directory found. Run `gravito make:seeder` first.'))
    } else {
      console.error(pc.red(`❌ Seeding failed: ${err.message}`))
      process.exit(1)
    }
  }
}

/**
 * Deploy database (health check + migrations).
 */
export async function dbDeploy(options: {
  entry?: string
  noMigrations?: boolean
  seeds?: boolean
  skipHealthCheck?: boolean
  noValidate?: boolean
}) {
  console.log(pc.cyan('🚀 Deploying database...'))

  try {
    const entryFile = options.entry ?? 'src/index.ts'
    const entry = await import(path.join(process.cwd(), entryFile))
    const core = entry.default?.core || entry.core

    if (!core) {
      throw new Error('Could not find core instance')
    }

    const db = core.services.get('db') || core.container.make('db')
    if (!db) {
      throw new Error('Database service not found')
    }

    if (typeof db.deploy !== 'function') {
      throw new Error('Database service does not support deploy()')
    }

    const result = await db.deploy({
      runMigrations: !options.noMigrations,
      runSeeds: !!options.seeds,
      skipHealthCheck: !!options.skipHealthCheck,
      validateBeforeDeploy: !options.noValidate,
    })

    if (result.success) {
      console.log(pc.green('✅ Database deployment complete'))
    } else {
      console.error(pc.red(`❌ Database deployment failed: ${result.error}`))
      process.exit(1)
    }
  } catch (err: any) {
    console.error(pc.red(`❌ Database deployment failed: ${err.message}`))
    process.exit(1)
  }
}

async function runSeeder(filepath: string) {
  const filename = path.basename(filepath)
  console.log(pc.gray(`  Running ${filename}...`))

  try {
    // Dynamic import the entry file to get core
    const entry = await import(path.join(process.cwd(), 'src/index.ts'))
    const core = entry.default?.core || entry.core

    if (!core) {
      throw new Error('Could not find core instance')
    }

    const db = core.services.get('db') || core.container.make('db')
    if (!db) {
      throw new Error('Database service not found')
    }

    // Import and run seeder
    const seeder = await import(filepath)
    const seedFn = seeder.default || seeder.seed
    await seedFn(db)
  } catch (err: any) {
    console.error(pc.red(`  Failed: ${err.message}`))
    throw err
  }
}
