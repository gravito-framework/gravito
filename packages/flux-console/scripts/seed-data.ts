import { Job, QueueManager } from '@gravito/stream'

// Define a simple Job class since QueueManager expects Job instances
class TestJob extends Job {
  constructor(public payload: any) {
    super()
  }

  async handle(): Promise<void> {
    // No-op
  }
}

// Initialize Queue Manager
const stream = new QueueManager({
  default: 'redis',
  connections: {
    redis: {
      driver: 'redis',
      client: {
        // Passing raw config for now, assuming RedisDriver handles it or we need to pass a client instance
        host: 'localhost',
        port: 6379,
      },
    },
  },
})

// Since we can't easily pass a raw client config if the driver expects an instance in this context,
// we'll try to rely on the fact that we're likely in a node env where we can just require ioredis if needed.
// However, let's look at how the app does it.
// Actually, for this simple test script, we might just want to use the Redis driver directly if we can,
// or better yet, just construct the QueueManager correctly.

// But wait, the previous error was `stream.dispatch is not a function`.
// QueueManager has `push(job)`.

async function main() {
  console.log('[TestProducer] Starting to produce test data...')

  const queueName = 'orders'

  // 1. Create jobs
  for (let i = 0; i < 5; i++) {
    const job = new TestJob({ id: `order-${i}`, status: 'pending' })
    job.queueName = queueName
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

  console.log('[TestProducer] Done producing data.')
  process.exit(0)
}

// Fix: The RedisDriver likely expects a Redis client INSTANCE, not config, based on reading QueueManager code:
// `const client = (config as { client?: unknown }).client`
// So let's instantiate one.
import Redis from 'ioredis'

const redisClient = new Redis({ host: 'localhost', port: 6379 })

// Re-init with correct client
const streamWithClient = new QueueManager({
  default: 'redis',
  connections: {
    redis: {
      driver: 'redis',
      client: redisClient,
    },
  },
})

// Overwrite the main function to use streamWithClient
async function mainCorrect() {
  console.log('[TestProducer] Starting to produce test data...')

  const queueName = 'orders'

  // 1. Create jobs
  for (let i = 0; i < 5; i++) {
    const job = new TestJob({ id: `order-${i}`, status: 'pending' })
    job.queueName = queueName
    await streamWithClient.push(job)
    console.log(`[TestProducer] Pushed job: order-${i}`)
  }

  // 2. Create another queue
  for (let i = 10; i < 15; i++) {
    const job = new TestJob({ id: `notif-${i}`, type: 'email' })
    job.queueName = 'notifications'
    await streamWithClient.push(job)
    console.log(`[TestProducer] Pushed job: notif-${i}`)
  }

  console.log('[TestProducer] Done producing data.')
  process.exit(0)
}

mainCorrect().catch(console.error)
