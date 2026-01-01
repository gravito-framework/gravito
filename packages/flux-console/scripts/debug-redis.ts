import Redis from 'ioredis'

async function main() {
  const redis = new Redis('redis://localhost:6379')

  console.log('--- Debugging Redis Queues ---')

  const keys = await redis.keys('queue:*')
  console.log('Keys found:', keys)

  const ordersLen = await redis.llen('queue:orders')
  console.log('queue:orders length:', ordersLen)

  if (ordersLen > 0) {
    const item = await redis.lrange('queue:orders', 0, 0)
    console.log('First item in queue:orders:', item)
  }

  const paused = await redis.get('queue:orders:paused')
  console.log('queue:orders:paused:', paused)

  redis.disconnect()
}

main().catch(console.error)
