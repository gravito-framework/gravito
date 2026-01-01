import { Consumer, Job, QueueManager } from '@gravito/stream'
import Redis from 'ioredis'

// 1. Define the Job Class
class TestJob extends Job {
  constructor(public payload: any) {
    super()
    if (payload?.id) this.id = payload.id
  }

  async handle() {
    console.log(`[Demo] Handling job ${this.id || 'unknown'} (Attempt: ${this.attempts})`)

    // Example: Custom Backoff (2s initial, 3x multiplier)
    this.backoff(2, 3)

    // Simulate Failure for DLQ testing
    if (this.id?.includes('fail')) {
      throw new Error(`Simulated permanent failure for ${this.id}`)
    }

    // Report throughput to Flux Console
    const now = Math.floor(Date.now() / 60000)
    await redis.incr(`flux_console:throughput:${now}`)
    await redis.expire(`flux_console:throughput:${now}`, 86400) // 24h

    await new Promise((resolve) => setTimeout(resolve, 500))
  }
}

// 2. Setup Redis & QueueManager
const redis = new Redis('redis://localhost:6379')

const manager = new QueueManager({
  default: 'redis',
  connections: {
    redis: {
      driver: 'redis',
      client: redis,
    },
  },
})

// 3. Register the Job Class
manager.registerJobClasses([TestJob])

// 4. Start Consumer with Framework Monitoring
const consumer = new Consumer(manager, {
  queues: ['orders', 'notifications'],
  pollInterval: 500,
  monitor: {
    prefix: 'flux_console:',
  },
})

console.log('[Demo] Worker started with framework monitoring!')
console.log('Watching queues: orders, notifications')

consumer.start().catch((err) => {
  console.error('[Demo] Consumer crashed:', err)
})
