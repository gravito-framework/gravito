import { Consumer, Job, QueueManager } from '@gravito/stream'
import Redis from 'ioredis'

// 1. Define the Job Class (Must match the name used in seed-data aka "TestJob")
class TestJob extends Job {
  constructor(public payload: any) {
    super()
  }

  async handle() {
    console.log(`[Worker] ⚙️ Processing ${this.queueName} job:`, this.payload)

    // Report throughput to Flux Console
    const now = Math.floor(Date.now() / 60000)
    await redis.incr(`flux_console:throughput:${now}`)
    await redis.expire(`flux_console:throughput:${now}`, 86400) // 24h

    await new Promise((resolve) => setTimeout(resolve, 500))
    console.log(`[Worker] ✅ Done: ${this.payload.id}`)
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

// 3. Register the Job Class so Deserializer knows how to hydrate "TestJob"
manager.registerJobClasses([TestJob])

// 4. Start Consumer
const consumer = new Consumer(manager, {
  queues: ['orders', 'notifications'],
  pollInterval: 500,
})

console.log('[Demo] Worker started! Watching queues: orders, notifications')

// Heartbeat logic
const workerId = `worker-${Math.random().toString(36).substr(2, 6)}`
setInterval(async () => {
  const info = {
    id: workerId,
    status: 'online',
    hostname: require('os').hostname(),
    pid: process.pid,
    uptime: Math.floor(process.uptime()),
    last_ping: new Date().toISOString(),
  }
  await redis.set(`flux_console:worker:${workerId}`, JSON.stringify(info), 'EX', 10)
}, 5000)

consumer.start().catch(console.error)
