import { Consumer } from '@gravito/stream'
import { env } from '../env'
import { getQueueManager } from '../stream'

export async function startAllConsumers() {
  const queueManager = await getQueueManager()

  const consumer = new Consumer(queueManager, {
    queues: [env.rabbitQueue],
    pollInterval: 500,
    workerOptions: {
      maxAttempts: 3,
    },
  })

  console.log(`🚀 Starting @gravito/stream Consumer with ${env.queueDriver} driver...`)

  await consumer.start()

  process.on('SIGINT', async () => {
    console.log('\nShutting down consumers...')
    await consumer.stop()
    process.exit(0)
  })
}
