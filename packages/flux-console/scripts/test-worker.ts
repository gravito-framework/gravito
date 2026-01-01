#!/usr/bin/env bun
/**
 * Simple Worker for Testing
 *
 * This worker will process jobs from the test queues.
 *
 * Usage:
 *   bun scripts/test-worker.ts
 */

import { Consumer, QueueManager } from '@gravito/stream'
import { Redis } from 'ioredis'

const redis = new Redis('redis://localhost:6379')

const manager = new QueueManager({
  default: 'redis',
  connections: {
    redis: {
      driver: 'redis',
      client: redis,
      prefix: 'queue:',
    },
  },
})

// Register job classes
class TestJob {
  public queueName = 'test-batch'
  public connectionName = 'redis'

  constructor(
    public id: string,
    public shouldFail = false
  ) {}

  async handle() {
    console.log(`[TestJob] Processing job ${this.id}`)

    // Simulate work
    await new Promise((resolve) => setTimeout(resolve, 100))

    if (this.shouldFail) {
      throw new Error(`Intentional failure for job ${this.id}`)
    }

    console.log(`[TestJob] ✅ Completed job ${this.id}`)
    return `Job ${this.id} completed`
  }
}

manager.registerJobClasses([TestJob])

// Create consumers for each test queue
const queues = ['test-batch', 'test-batch-fail', 'test-batch-delayed']

console.log('🚀 Starting test workers...\n')

for (const queueName of queues) {
  const consumer = new Consumer(manager, {
    queue: queueName,
    connection: 'redis',
    maxJobs: 5, // Process 5 jobs concurrently
    pollInterval: 1000, // Check for new jobs every second
  })

  consumer.on('job:start', (job) => {
    console.log(`[${queueName}] 🔄 Started: ${(job as any).id}`)
  })

  consumer.on('job:success', (job) => {
    console.log(`[${queueName}] ✅ Success: ${(job as any).id}`)
  })

  consumer.on('job:failed', (job, error) => {
    console.log(`[${queueName}] ❌ Failed: ${(job as any).id} - ${error.message}`)
  })

  consumer.start()
  console.log(`✅ Worker started for queue: ${queueName}`)
}

console.log('\n📊 Workers are now processing jobs...')
console.log('💡 Press Ctrl+C to stop\n')

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down workers...')
  await redis.quit()
  process.exit(0)
})
