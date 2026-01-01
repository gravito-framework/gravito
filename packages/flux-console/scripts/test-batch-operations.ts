#!/usr/bin/env bun
/**
 * Batch Operations Test Script
 *
 * This script creates test jobs to verify the batch operations feature.
 *
 * Usage:
 *   bun scripts/test-batch-operations.ts
 */

import { QueueManager } from '@gravito/stream'
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

// Simple test job
class TestJob {
  public queueName = 'test-batch'
  public connectionName = 'redis'

  constructor(
    public id: string,
    public shouldFail = false
  ) {}

  async handle() {
    console.log(`[TestJob] Processing job ${this.id}`)
    if (this.shouldFail) {
      throw new Error(`Intentional failure for job ${this.id}`)
    }
    return `Job ${this.id} completed`
  }
}

async function createTestJobs() {
  console.log('🚀 Creating test jobs for batch operations...\n')

  // Scenario 1: Create 100 normal jobs
  console.log('📦 Creating 100 normal jobs in "test-batch" queue...')
  const normalJobs = []
  for (let i = 1; i <= 100; i++) {
    normalJobs.push(new TestJob(`normal-${i}`, false))
  }
  await manager.pushMany(normalJobs)
  console.log('✅ Created 100 normal jobs\n')

  // Scenario 2: Create 50 jobs that will fail
  console.log('💥 Creating 50 jobs that will fail in "test-batch-fail" queue...')
  const failJobs = []
  for (let i = 1; i <= 50; i++) {
    const job = new TestJob(`fail-${i}`, true)
    job.queueName = 'test-batch-fail'
    failJobs.push(job)
  }
  await manager.pushMany(failJobs)
  console.log('✅ Created 50 failing jobs\n')

  // Scenario 3: Create delayed jobs
  console.log('⏰ Creating 30 delayed jobs in "test-batch-delayed" queue...')
  const delayedJobs = []
  for (let i = 1; i <= 30; i++) {
    const job = new TestJob(`delayed-${i}`, false)
    job.queueName = 'test-batch-delayed'
    delayedJobs.push(job)
  }

  // Push with delay (using Redis ZADD for delayed queue)
  const serializer = manager.getSerializer()
  for (const job of delayedJobs) {
    const serialized = serializer.serialize(job)
    const delayTime = Date.now() + 60 * 1000 // 1 minute delay
    await redis.zadd('queue:test-batch-delayed:delayed', delayTime, JSON.stringify(serialized))
  }
  console.log('✅ Created 30 delayed jobs (1 minute delay)\n')

  // Summary
  console.log('📊 Test Data Summary:')
  console.log('━'.repeat(50))
  console.log('Queue: test-batch')
  console.log('  - 100 waiting jobs (ready to process)')
  console.log('')
  console.log('Queue: test-batch-fail')
  console.log('  - 50 waiting jobs (will fail when processed)')
  console.log('')
  console.log('Queue: test-batch-delayed')
  console.log('  - 30 delayed jobs (scheduled for 1 minute from now)')
  console.log('━'.repeat(50))
  console.log('')
  console.log('🎯 Testing Scenarios:')
  console.log('1. Open Flux Console: http://localhost:3000')
  console.log('2. Navigate to "test-batch" queue')
  console.log('3. Test multi-select: Select 10-20 jobs')
  console.log('4. Test bulk delete: Click "Delete Selected"')
  console.log('5. Test "Delete All": Click "Delete All 100" button')
  console.log('')
  console.log('6. Navigate to "test-batch-delayed" queue')
  console.log('7. Switch to "Delayed" tab')
  console.log('8. Test bulk retry: Select some jobs and "Retry Selected"')
  console.log('9. Test "Retry All": Click "Retry All 30" button')
  console.log('')
  console.log('10. Process some jobs from "test-batch-fail" to create failures')
  console.log('11. Switch to "Failed" tab')
  console.log('12. Test bulk operations on failed jobs')
  console.log('')
  console.log('💡 Keyboard Shortcuts:')
  console.log('  - Ctrl+A / Cmd+A: Select all visible jobs')
  console.log('  - Escape: Clear selection / Close dialog / Close inspector')
  console.log('')
}

async function simulateFailures() {
  console.log('💥 Simulating job failures...\n')

  // Move some jobs from waiting to failed
  const failedCount = 25
  for (let i = 1; i <= failedCount; i++) {
    const job = new TestJob(`fail-${i}`, true)
    job.queueName = 'test-batch-fail'
    const serialized = manager.getSerializer().serialize(job)
    serialized.error = `Simulated error for testing batch operations (job ${i})`
    serialized.failedAt = Date.now()

    // Add to failed queue
    await redis.lpush('queue:test-batch-fail:failed', JSON.stringify(serialized))
  }

  console.log(`✅ Created ${failedCount} failed jobs in "test-batch-fail" queue`)
  console.log('   You can now test bulk retry on failed jobs!\n')
}

async function cleanup() {
  console.log('🧹 Cleaning up test data...\n')

  const queues = ['test-batch', 'test-batch-fail', 'test-batch-delayed']

  for (const queue of queues) {
    await redis.del(`queue:${queue}`)
    await redis.del(`queue:${queue}:delayed`)
    await redis.del(`queue:${queue}:failed`)
    await redis.del(`queue:${queue}:active`)
  }

  console.log('✅ Cleanup complete!\n')
}

// Main execution
const command = process.argv[2]

switch (command) {
  case 'create':
    await createTestJobs()
    break

  case 'fail':
    await simulateFailures()
    break

  case 'cleanup':
    await cleanup()
    break

  default:
    console.log('📖 Usage:')
    console.log('  bun scripts/test-batch-operations.ts create   - Create test jobs')
    console.log('  bun scripts/test-batch-operations.ts fail     - Simulate failures')
    console.log('  bun scripts/test-batch-operations.ts cleanup  - Clean up test data')
    console.log('')
    console.log('💡 Recommended workflow:')
    console.log('  1. bun scripts/test-batch-operations.ts create')
    console.log('  2. bun scripts/test-batch-operations.ts fail')
    console.log('  3. Test batch operations in Flux Console')
    console.log('  4. bun scripts/test-batch-operations.ts cleanup')
}

await redis.quit()
process.exit(0)
