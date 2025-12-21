import fs from 'node:fs/promises'
import path from 'node:path'
import { spawn } from 'bun'

/**
 * Migration result interface
 */
export interface MigrationResult {
  success: boolean
  message: string
  migrations?: string[]
  error?: string
}

/**
 * Migration abstraction interface
 * Allows different ORM backends to implement their own migration logic
 */
export interface MigrationDriver {
  /**
   * Generate a new migration file
   */
  generate(name: string): Promise<MigrationResult>

  /**
   * Run pending migrations
   */
  migrate(): Promise<MigrationResult>

  /**
   * Rollback the last migration (if supported)
   */
  rollback?(): Promise<MigrationResult>

  /**
   * Drop all tables and re-run migrations
   */
  fresh(): Promise<MigrationResult>

  /**
   * Get migration status
   */
  status(): Promise<{ pending: string[]; applied: string[] }>
}

/**
 * Drizzle Kit Migration Driver
 * Wraps drizzle-kit CLI commands
 */
export class DrizzleMigrationDriver implements MigrationDriver {
  constructor(
    private configPath = 'drizzle.config.ts',
    private migrationsDir = 'src/database/migrations'
  ) {}

  async generate(name: string): Promise<MigrationResult> {
    const timestamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14)
    const filename = `${timestamp}_${name}.ts`
    const filepath = path.join(process.cwd(), this.migrationsDir, filename)

    // Ensure directory exists
    await fs.mkdir(path.dirname(filepath), { recursive: true })

    // Create migration stub
    const content = `import { sql } from 'drizzle-orm'
import type { DBService } from '@gravito/db'

export async function up(db: DBService): Promise<void> {
  // TODO: Implement migration
  // await db.raw.execute(sql\`CREATE TABLE ...\`)
}

export async function down(db: DBService): Promise<void> {
  // TODO: Implement rollback
  // await db.raw.execute(sql\`DROP TABLE ...\`)
}
`

    await fs.writeFile(filepath, content, 'utf-8')

    return {
      success: true,
      message: `Migration created: ${filename}`,
      migrations: [filename],
    }
  }

  async migrate(): Promise<MigrationResult> {
    try {
      // Use drizzle-kit push for schema sync
      const proc = spawn(['bunx', 'drizzle-kit', 'push', '--config', this.configPath], {
        cwd: process.cwd(),
        stdout: 'pipe',
        stderr: 'pipe',
      })

      const output = await new Response(proc.stdout).text()
      const exitCode = await proc.exited

      if (exitCode !== 0) {
        const error = await new Response(proc.stderr).text()
        return {
          success: false,
          message: 'Migration failed',
          error: error || output,
        }
      }

      return {
        success: true,
        message: 'Migrations applied successfully',
      }
    } catch (err: any) {
      return {
        success: false,
        message: 'Migration failed',
        error: err.message,
      }
    }
  }

  async fresh(): Promise<MigrationResult> {
    try {
      // Drop all tables first
      const dropProc = spawn(['bunx', 'drizzle-kit', 'drop', '--config', this.configPath], {
        cwd: process.cwd(),
        stdout: 'pipe',
        stderr: 'pipe',
      })
      await dropProc.exited

      // Then push schema
      return this.migrate()
    } catch (err: any) {
      return {
        success: false,
        message: 'Fresh migration failed',
        error: err.message,
      }
    }
  }

  async status(): Promise<{ pending: string[]; applied: string[] }> {
    // Drizzle doesn't have a built-in status command
    // For now, list migration files
    try {
      const migrationsPath = path.join(process.cwd(), this.migrationsDir)
      const files = await fs.readdir(migrationsPath)
      const migrations = files.filter((f) => f.endsWith('.ts'))

      return {
        pending: [], // Would need DB introspection to determine
        applied: migrations,
      }
    } catch {
      return { pending: [], applied: [] }
    }
  }
}
