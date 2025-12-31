import { QueueManager } from '@gravito/stream'
import * as amqplib from 'amqplib'
import { env } from './env'
import { ProcessWorkflowJob } from './jobs/ProcessWorkflowJob'

let manager: QueueManager | null = null

export async function getQueueManager() {
  if (manager) return manager

  const connection = await amqplib.connect(env.rabbitUrl)

  manager = new QueueManager({
    default: 'rabbitmq',
    connections: {
      rabbitmq: {
        driver: 'rabbitmq',
        client: connection,
        exchange: env.rabbitExchange,
      },
    },
  })

  // Register job classes for serialization
  manager.registerJobClasses([ProcessWorkflowJob as any])

  return manager
}
