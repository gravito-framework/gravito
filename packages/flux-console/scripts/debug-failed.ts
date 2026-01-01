import Redis from 'ioredis'

async function main() {
  const redis = new Redis('redis://localhost:6379')
  console.log('--- Inspecting Failed Jobs ---')
  const failed = await redis.lrange('queue:orders:failed', 0, 4)
  failed.forEach((f, i) => {
    console.log(`[${i}]`, f)
  })
  redis.disconnect()
}

main().catch(console.error)
