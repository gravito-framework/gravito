import { RedisDriver } from '@gravito/stream'
import Redis from 'ioredis'

async function main() {
  console.log('🚀 Generating random traffic via RedisDriver...')

  // Connect to Redis
  const redis = new Redis('redis://localhost:6379')

  // Initialize Driver with same prefix as QueueService (default 'queue:')
  const driver = new RedisDriver({
    driver: 'redis',
    client: redis,
    prefix: 'queue:', // Match QueueService default prefix
  })

  const queues = ['email', 'billing', 'notifications', 'analytics', 'reports']
  const priorities = [10, 20, 30] // Arbitrary priorities

  for (let i = 0; i < 50; i++) {
    const queueName = queues[Math.floor(Math.random() * queues.length)]

    // Use 'orders' occasionally to see them processed by demo-worker
    const finalQueue = Math.random() > 0.7 ? 'orders' : queueName

    console.log(`[${i + 1}/50] Pushing job to: ${finalQueue}`)

    const isFailure = Math.random() > 0.8
    const id = isFailure ? `job-fail-${Date.now()}-${i}` : `job-${Date.now()}-${i}`

    // Push as TestJob so it can be deserialized and processed (or failed) by Worker
    await driver.push(
      finalQueue,
      {
        id,
        type: 'class',
        className: 'TestJob',
        data: JSON.stringify({
          message: `Random data ${Math.random()}`,
          queue: finalQueue,
        }),
        createdAt: Date.now(),
        attempts: 0,
      },
      { priority: priorities[Math.floor(Math.random() * priorities.length)] }
    )

    await new Promise((r) => setTimeout(r, 100))
  }

  // Force disconnect
  redis.disconnect()
  console.log('✅ Done! Check Flux Console.')
}

main().catch(console.error)
