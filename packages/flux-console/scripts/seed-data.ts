import { Job, QueueManager } from '@gravito/stream'
import Redis from 'ioredis'

// Define a simple Job class
class TestJob extends Job {
  constructor(public payload: any) {
    super()
    if (payload?.id) this.id = payload.id
  }

  async handle(): Promise<void> {
    // No-op
  }
}

const redisClient = new Redis({ host: 'localhost', port: 6379 })

const stream = new QueueManager({
  default: 'redis',
  connections: {
    redis: {
      driver: 'redis',
      client: redisClient,
    },
  },
})

async function main() {
  console.log('[TestProducer] Starting to produce test data...')

  // 1. Create immediate jobs
  for (let i = 0; i < 5; i++) {
    const job = new TestJob({ id: `order-${i}`, status: 'pending' })
    job.queueName = 'orders'
    await stream.push(job)
    console.log(`[TestProducer] Pushed job: order-${i}`)
  }

  // 2. Create another queue
  for (let i = 10; i < 15; i++) {
    const job = new TestJob({ id: `notif-${i}`, type: 'email' })
    job.queueName = 'notifications'
    await stream.push(job)
    console.log(`[TestProducer] Pushed job: notif-${i}`)
  }

  // 3. Create delayed jobs
  for (let i = 0; i < 3; i++) {
    const job = new TestJob({ id: `delayed-order-${i}`, status: 'scheduled' })
    job.queueName = 'orders'
    job.delay(30 + i * 30) // 30s, 60s, 90s delay
    await stream.push(job)
    console.log(`[TestProducer] Pushed delayed job: delayed-order-${i} (delay ${30 + i * 30}s)`)
  }

  // 4. Create jobs destined to fail (DLQ testing)
  for (let i = 0; i < 2; i++) {
    const job = new TestJob({ id: `fail-order-${i}`, status: 'doomed' })
    job.queueName = 'orders'
    job.maxAttempts = 2
    await stream.push(job)
    console.log(`[TestProducer] Pushed failing job: fail-order-${i}`)
  }

  console.log('[TestProducer] Done producing data.')
  process.exit(0)
}

main().catch(console.error)
