import { Schema } from '@gravito/atlas'
import type { PersistenceAdapter, SerializedJob } from '../types'

/**
 * SQLite Persistence Adapter.
 * Archives jobs into a local SQLite database for zero-config persistence.
 */
export class SQLitePersistence implements PersistenceAdapter {
  /**
   * @param db - An Atlas DB instance (SQLite driver).
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
    } catch (err: any) {
      console.error(`[SQLitePersistence] Failed to archive job ${job.id}:`, err.message)
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
          const job = typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload
          return { ...job, _status: r.status, _archivedAt: r.archived_at }
        } catch (_e) {
          return null
        }
      })
      .filter(Boolean)
  }

  /**
   * Search jobs from the archive.
   */
  async search(
    query: string,
    options: { limit?: number; offset?: number; queue?: string } = {}
  ): Promise<SerializedJob[]> {
    let q = this.db.table(this.table)

    if (options.queue) {
      q = q.where('queue', options.queue)
    }

    const rows = await q
      .where((sub: any) => {
        sub
          .where('job_id', 'like', `%${query}%`)
          .orWhere('payload', 'like', `%${query}%`)
          .orWhere('error', 'like', `%${query}%`)
      })
      .orderBy('archived_at', 'desc')
      .limit(options.limit ?? 50)
      .offset(options.offset ?? 0)
      .get()

    return rows
      .map((r: any) => {
        try {
          const job = typeof r.payload === 'string' ? JSON.parse(r.payload) : r.payload
          return { ...job, _status: r.status, _archivedAt: r.archived_at }
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
   * Count jobs in the archive.
   */
  async count(queue: string, options: { status?: 'completed' | 'failed' } = {}): Promise<number> {
    let query = this.db.table(this.table).where('queue', queue)

    if (options.status) {
      query = query.where('status', options.status)
    }

    const result = await query.count('id as total').first()
    return result?.total || 0
  }

  /**
   * Setup table for SQLite.
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
      table.text('payload') // SQLite uses text for JSON
      table.text('error').nullable()
      table.timestamp('created_at').nullable()
      table.timestamp('archived_at').nullable()

      // Indexes
      table.index(['queue', 'archived_at'])
      table.index(['archived_at'])
    })

    console.log(`[SQLitePersistence] Created local archive table: ${this.table}`)
  }
}
