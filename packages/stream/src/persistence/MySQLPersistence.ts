import { DB, Schema } from '@gravito/atlas'
import type { PersistenceAdapter, SerializedJob } from '../types'

/**
 * MySQL Persistence Adapter.
 * Archives jobs into a MySQL table for long-term auditing.
 */
export class MySQLPersistence implements PersistenceAdapter {
  /**
   * @param db - An Atlas DB instance or compatible QueryBuilder.
   * @param table - The name of the table to store archived jobs.
   */
  constructor(
    private db: any,
    private table = 'flux_job_archive'
  ) {}

  /**
   * Archive a job.
   */
  async archive(queue: string, job: SerializedJob, status: 'completed' | 'failed'): Promise<void> {
    try {
      await this.db.table(this.table).insert({
        job_id: job.id,
        queue: queue,
        status: status,
        payload: JSON.stringify(job),
        error: job.error || null,
        created_at: new Date(job.createdAt),
        archived_at: new Date(),
      })
    } catch (err) {
      console.error(`[MySQLPersistence] Failed to archive job ${job.id}:`, err)
    }
  }

  /**
   * Find a specific job in the archive.
   */
  async find(queue: string, id: string): Promise<SerializedJob | null> {
    const row = await this.db.table(this.table).where('queue', queue).where('job_id', id).first()

    if (!row) {
      return null
    }

    // Parse the stored payload
    try {
      const job = typeof row.payload === 'string' ? JSON.parse(row.payload) : row.payload
      return job
    } catch (_e) {
      return null
    }
  }

  /**
   * List jobs from the archive.
   */
  async list(
    queue: string,
    options: { limit?: number; offset?: number; status?: 'completed' | 'failed' } = {}
  ): Promise<SerializedJob[]> {
    let query = this.db.table(this.table).where('queue', queue)

    if (options.status) {
      query = query.where('status', options.status)
    }

    const rows = await query
      .orderBy('archived_at', 'desc')
      .limit(options.limit ?? 50)
      .offset(options.offset ?? 0)
      .get()

    return rows
      .map((r: any) => {
        try {
          return typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload
        } catch (_e) {
          return null
        }
      })
      .filter(Boolean)
  }

  /**
   * Remove old records from the archive.
   */
  async cleanup(days: number): Promise<number> {
    const threshold = new Date()
    threshold.setDate(threshold.getDate() - days)

    const result = await this.db.table(this.table).where('archived_at', '<', threshold).delete()

    return result
  }

  /**
   * Help script to create the necessary table.
   */
  async setupTable(): Promise<void> {
    const exists = await Schema.hasTable(this.table)
    if (exists) {
      return
    }

    await Schema.create(this.table, (table) => {
      table.id()
      table.string('job_id', 64)
      table.string('queue', 128)
      table.string('status', 20)
      table.json('payload')
      table.text('error').nullable()
      table.timestamp('created_at').nullable()
      table.timestamp('archived_at').default(DB.raw('CURRENT_TIMESTAMP'))

      // Optimized Indexes
      table.index(['queue', 'archived_at']) // Efficient for listing/pagination
      table.index(['queue', 'job_id']) // Efficient for finding specific jobs
      table.index(['status', 'archived_at']) // Efficient for status-based cleanup/view
      table.index(['archived_at']) // Critical for cleanup by date
    })

    console.log(`[MySQLPersistence] Created archive table: ${this.table}`)
  }
}
