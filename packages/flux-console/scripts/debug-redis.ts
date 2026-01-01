import Redis from 'ioredis'

async function main() {
  const redis = new Redis('redis://localhost:6379')

  console.log('--- Debugging Redis Queues ---')

  const keys = await redis.keys('queue:*')
  console.log('Keys found:', keys)

  for (const key of keys) {
    if (key.includes(':failed') || key.includes(':paused') || key.includes(':delayed')) continue
    const type = await redis.type(key)
    if (type === 'list') {
      const len = await redis.llen(key)
      console.log(`${key} length:`, len)
    }
  }

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
