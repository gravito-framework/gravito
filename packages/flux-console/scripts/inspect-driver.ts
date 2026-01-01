import { RedisDriver } from '@gravito/stream'
import Redis from 'ioredis' // ioredis is in package.json

async function main() {
  console.log('Inspecting RedisDriver...')
  const redis = new Redis('redis://localhost:6379')
  const driver = new RedisDriver({
    driver: 'redis',
    client: redis,
    prefix: 'bull:', // Default BullMQ prefix
  })

  console.log('Driver keys:', Object.keys(driver))
  console.log('Driver prototype:', Object.getOwnPropertyNames(Object.getPrototypeOf(driver)))

  process.exit(0)
}

main().catch(console.error)
