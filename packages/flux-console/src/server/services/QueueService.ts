import { QueueManager } from '@gravito/stream'
import { Redis } from 'ioredis'

export interface QueueStats {
  name: string
  waiting: number
  delayed: number
  // Active and Failed are tricky without explicit support in Driver,
  // we will support them if the schema allows.
}

export class QueueService {
  private redis: Redis
  private prefix: string

  constructor(redisUrl: string, prefix = 'queue:') {
    this.redis = new Redis(redisUrl, {
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
    await this.redis.connect()
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
          return { name, waiting, delayed }
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
    type: 'waiting' | 'delayed' = 'waiting',
    start = 0,
    stop = 49
  ): Promise<any[]> {
    const key = `${this.prefix}${queueName}`
    let rawJobs: string[] = []

    if (type === 'delayed') {
      rawJobs = await this.redis.zrange(`${key}:delayed`, start, stop)
    } else {
      rawJobs = await this.redis.lrange(key, start, stop)
    }

    return rawJobs.map((jobStr) => {
      try {
        return JSON.parse(jobStr)
      } catch (e) {
        return { raw: jobStr, error: 'Failed to parse JSON' }
      }
    })
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
}
