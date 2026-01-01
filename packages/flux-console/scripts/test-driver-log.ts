import { RedisDriver } from '@gravito/stream'
import Redis from 'ioredis'

async function main() {
  const redis = new Redis('redis://localhost:6379')
  const driver = new RedisDriver({
    client: redis,
    prefix: 'queue:',
  })

  console.log('Testing RedisDriver.publishLog...')

  // Simulate what Consumer does: calls publishLog with monitor prefix
  await driver.publishLog(
    {
      level: 'info',
      message: 'Test log from RedisDriver directly',
      workerId: 'tester',
      timestamp: new Date().toISOString(),
    },
    'flux_console:'
  )

  console.log('Published log to flux_console:logs')
  redis.disconnect()
}

main().catch(console.error)
