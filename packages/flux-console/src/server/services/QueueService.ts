import { QueueManager } from '@gravito/stream'
import { Redis } from 'ioredis'

export interface QueueStats {
  name: string
  waiting: number
  delayed: number
  failed: number
}

export class QueueService {
  private redis: Redis
  private subRedis: Redis
  private prefix: string

  constructor(redisUrl: string, prefix = 'queue:') {
    this.redis = new Redis(redisUrl, {
      lazyConnect: true,
    })
    this.subRedis = new Redis(redisUrl, {
      lazyConnect: true,
    })
    this.prefix = prefix

    // Initialized for potential use
    new QueueManager({
      default: 'redis',
      connections: {
        redis: {
          driver: 'redis',
          client: this.redis as any,
          prefix,
        },
      },
    })
  }

  async connect() {
    await Promise.all([this.redis.connect(), this.subRedis.connect()])
  }

  /**
   * Discovers queues using SCAN to avoid blocking Redis.
   */
  async listQueues(): Promise<QueueStats[]> {
    const queues = new Set<string>()
    let cursor = '0'
    let limit = 1000

    do {
      const result = await this.redis.scan(cursor, 'MATCH', `${this.prefix}*`, 'COUNT', 100)
      cursor = result[0]
      const keys = result[1]

      for (const key of keys) {
        const relative = key.slice(this.prefix.length)
        const parts = relative.split(':')
        const candidateName = parts[0]

        if (candidateName && candidateName !== 'active') {
          queues.add(candidateName)
        }
      }
      limit--
    } while (cursor !== '0' && limit > 0)

    const stats: QueueStats[] = []
    const queueNames = Array.from(queues).sort()

    const BATCH_SIZE = 10

    for (let i = 0; i < queueNames.length; i += BATCH_SIZE) {
      const batch = queueNames.slice(i, i + BATCH_SIZE)
      const batchResults = await Promise.all(
        batch.map(async (name) => {
          const waiting = await this.redis.llen(`${this.prefix}${name}`)
          const delayed = await this.redis.zcard(`${this.prefix}${name}:delayed`)
          const failed = await this.redis.llen(`${this.prefix}${name}:failed`)
          return { name, waiting, delayed, failed }
        })
      )
      stats.push(...batchResults)
    }

    return stats
  }

  async retryDelayedJob(queueName: string): Promise<number> {
    const key = `${this.prefix}${queueName}`
    const delayKey = `${key}:delayed`

    const script = `
        local delayKey = KEYS[1]
        local queueKey = KEYS[2]
        
        local jobs = redis.call('ZRANGE', delayKey, 0, -1)
        
        if #jobs > 0 then
            redis.call('LPUSH', queueKey, unpack(jobs))
            redis.call('DEL', delayKey)
        end
        return #jobs
      `

    const movedCount = (await this.redis.eval(script, 2, delayKey, key)) as number
    return movedCount
  }

  async getJobs(
    queueName: string,
    type: 'waiting' | 'delayed' | 'failed' = 'waiting',
    start = 0,
    stop = 49
  ): Promise<any[]> {
    const key = `${this.prefix}${queueName}`
    let rawJobs: string[] = []

    if (type === 'delayed') {
      const results = await this.redis.zrange(`${key}:delayed`, start, stop, 'WITHSCORES')
      const formatted = []
      for (let i = 0; i < results.length; i += 2) {
        const jobStr = results[i]!
        const score = results[i + 1]!
        try {
          const parsed = JSON.parse(jobStr)
          formatted.push({
            ...parsed,
            _raw: jobStr,
            scheduledAt: new Date(parseInt(score)).toISOString(),
          })
        } catch (e) {
          formatted.push({ _raw: jobStr, _error: 'Failed to parse JSON' })
        }
      }
      return formatted
    } else {
      const listKey = type === 'failed' ? `${key}:failed` : key
      rawJobs = await this.redis.lrange(listKey, start, stop)
      return rawJobs.map((jobStr) => {
        try {
          const parsed = JSON.parse(jobStr)
          return { ...parsed, _raw: jobStr }
        } catch (e) {
          return { _raw: jobStr, _error: 'Failed to parse JSON' }
        }
      })
    }
  }

  /**
   * Records a snapshot of current global statistics for sparklines.
   */
  async recordStatusMetrics(): Promise<void> {
    const stats = await this.listQueues()
    const totals = stats.reduce(
      (acc, q) => {
        acc.waiting += q.waiting
        acc.delayed += q.delayed
        acc.failed += q.failed
        return acc
      },
      { waiting: 0, delayed: 0, failed: 0 }
    )

    const now = Math.floor(Date.now() / 60000)
    const pipe = this.redis.pipeline()

    // Store snapshots for last 60 minutes
    pipe.set(`flux_console:metrics:waiting:${now}`, totals.waiting, 'EX', 3600)
    pipe.set(`flux_console:metrics:delayed:${now}`, totals.delayed, 'EX', 3600)
    pipe.set(`flux_console:metrics:failed:${now}`, totals.failed, 'EX', 3600)

    // Also record worker count
    const workers = await this.listWorkers()
    pipe.set(`flux_console:metrics:workers:${now}`, workers.length, 'EX', 3600)

    await pipe.exec()
  }

  /**
   * Gets historical data for a specific metric.
   */
  async getMetricHistory(metric: string, limit = 15): Promise<number[]> {
    const now = Math.floor(Date.now() / 60000)
    const keys = []
    for (let i = limit - 1; i >= 0; i--) {
      keys.push(`flux_console:metrics:${metric}:${now - i}`)
    }

    const values = await this.redis.mget(...keys)
    return values.map((v) => parseInt(v || '0'))
  }

  /**
   * Retrieves throughput data for the last 15 minutes.
   */
  async getThroughputData(): Promise<{ timestamp: string; count: number }[]> {
    const now = Math.floor(Date.now() / 60000)
    const results = []

    for (let i = 14; i >= 0; i--) {
      const t = now - i
      const count = await this.redis.get(`flux_console:throughput:${t}`)
      const date = new Date(t * 60000)
      results.push({
        timestamp: `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`,
        count: parseInt(count || '0'),
      })
    }

    return results
  }

  /**
   * Lists all active workers by scanning heartbeat keys.
   */
  async listWorkers(): Promise<any[]> {
    const workers: any[] = []
    let cursor = '0'

    do {
      const [nextCursor, keys] = await this.redis.scan(cursor, 'MATCH', 'flux_console:worker:*')
      cursor = nextCursor

      if (keys.length > 0) {
        const values = await this.redis.mget(...keys)
        values.forEach((v) => {
          if (v) {
            try {
              workers.push(JSON.parse(v))
            } catch (e) {
              // Ignore malformed
            }
          }
        })
      }
    } while (cursor !== '0')

    return workers
  }

  /**
   * Deletes a specific job from a queue or delayed pool.
   */
  async deleteJob(
    queueName: string,
    type: 'waiting' | 'delayed' | 'failed',
    jobRaw: string
  ): Promise<boolean> {
    const key =
      type === 'delayed'
        ? `${this.prefix}${queueName}:delayed`
        : type === 'failed'
          ? `${this.prefix}${queueName}:failed`
          : `${this.prefix}${queueName}`
    const result =
      type === 'delayed'
        ? await this.redis.zrem(key, jobRaw)
        : await this.redis.lrem(key, 0, jobRaw)
    return result > 0
  }

  /**
   * Retries a specific delayed job by moving it back to the waiting queue.
   */
  async retryJob(queueName: string, jobRaw: string): Promise<boolean> {
    const key = `${this.prefix}${queueName}`
    const delayKey = `${key}:delayed`

    // Atomically move from ZSET to LIST
    const script = `
      local delayKey = KEYS[1]
      local queueKey = KEYS[2]
      local jobRaw = ARGV[1]
      
      local removed = redis.call('ZREM', delayKey, jobRaw)
      if removed > 0 then
        redis.call('LPUSH', queueKey, jobRaw)
        return 1
      end
      return 0
    `
    const result = await this.redis.eval(script, 2, delayKey, key, jobRaw)
    return result === 1
  }

  /**
   * Purges all jobs from a queue.
   */
  async purgeQueue(queueName: string): Promise<void> {
    const pipe = this.redis.pipeline()
    pipe.del(`${this.prefix}${queueName}`)
    pipe.del(`${this.prefix}${queueName}:delayed`)
    pipe.del(`${this.prefix}${queueName}:failed`)
    pipe.del(`${this.prefix}${queueName}:active`)
    await pipe.exec()
  }

  /**
   * Retries all failed jobs in a queue.
   */
  async retryAllFailedJobs(queueName: string): Promise<number> {
    const failedKey = `${this.prefix}${queueName}:failed`
    const queueKey = `${this.prefix}${queueName}`

    const script = `
        local failedKey = KEYS[1]
        local queueKey = KEYS[2]
        local jobs = redis.call('LRANGE', failedKey, 0, -1)
        if #jobs > 0 then
          redis.call('LPUSH', queueKey, unpack(jobs))
          redis.call('DEL', failedKey)
        end
        return #jobs
      `
    return (await this.redis.eval(script, 2, failedKey, queueKey)) as number
  }

  /**
   * Subscribes to the live log stream.
   */
  async subscribeLogs(onMessage: (msg: any) => void) {
    await this.subRedis.subscribe('flux_console:logs')
    this.subRedis.on('message', (channel, message) => {
      if (channel === 'flux_console:logs') {
        try {
          onMessage(JSON.parse(message))
        } catch (e) {
          // Ignore
        }
      }
    })
  }

  /**
   * Publishes a log message (used by workers).
   */
  async publishLog(log: { level: string; message: string; workerId: string; queue?: string }) {
    const payload = {
      ...log,
      timestamp: new Date().toISOString(),
    }
    await this.redis.publish('flux_console:logs', JSON.stringify(payload))
    // Also store in a capped list for history (last 100 logs)
    const pipe = this.redis.pipeline()
    pipe.lpush('flux_console:logs:history', JSON.stringify(payload))
    pipe.ltrim('flux_console:logs:history', 0, 99)
    await pipe.exec()
  }

  /**
   * Gets recent log history.
   */
  async getLogHistory(): Promise<any[]> {
    const logs = await this.redis.lrange('flux_console:logs:history', 0, -1)
    return logs.map((l) => JSON.parse(l)).reverse()
  }

  /**
   * Search jobs across all queues by ID or data content.
   */
  async searchJobs(
    query: string,
    options: { limit?: number; type?: 'all' | 'waiting' | 'delayed' | 'failed' } = {}
  ): Promise<any[]> {
    const { limit = 20, type = 'all' } = options
    const results: any[] = []
    const queryLower = query.toLowerCase()

    // Get all queues
    const queues = await this.listQueues()

    for (const queue of queues) {
      if (results.length >= limit) break

      const types = type === 'all' ? ['waiting', 'delayed', 'failed'] : [type]

      for (const jobType of types) {
        if (results.length >= limit) break

        const jobs = await this.getJobs(queue.name, jobType as any, 0, 99)

        for (const job of jobs) {
          if (results.length >= limit) break

          // Search in job ID
          const idMatch = job.id && String(job.id).toLowerCase().includes(queryLower)

          // Search in job name
          const nameMatch = job.name && String(job.name).toLowerCase().includes(queryLower)

          // Search in job data (stringify and search)
          let dataMatch = false
          try {
            const dataStr = JSON.stringify(job.data || job).toLowerCase()
            dataMatch = dataStr.includes(queryLower)
          } catch (e) {
            // Ignore stringify errors
          }

          if (idMatch || nameMatch || dataMatch) {
            results.push({
              ...job,
              _queue: queue.name,
              _type: jobType,
              _matchType: idMatch ? 'id' : nameMatch ? 'name' : 'data',
            })
          }
        }
      }
    }

    return results
  }
}
