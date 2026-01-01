import { QueueService } from '../src/server/services/QueueService'

async function main() {
  console.log('Veryifying Flux-Console Backend Logic...')
  const service = new QueueService('redis://localhost:6379')
  await service.connect()

  console.log('Connected to Redis. Listing queues...')
  const queues = await service.listQueues()
  console.log('Queues Found:', queues)

  if (queues.length === 0) {
    console.warn('No queues found. This might be expected if no workflows ran.')
  } else {
    console.log('Verification Success: Queue Discovery Works.')
  }

  process.exit(0)
}

main().catch((err) => {
  console.error('Verification Failed:', err)
  process.exit(1)
})
