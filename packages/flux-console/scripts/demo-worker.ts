import { Consumer, Job, QueueManager } from '@gravito/stream'
import Redis from 'ioredis'

// 1. Define the Job Class
class TestJob extends Job {
  constructor(public payload: any) {
    super()
  }

  async handle() {
    // Note: We no longer need manual publishLog here
    // as the framework handles it via { monitor: true }

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
