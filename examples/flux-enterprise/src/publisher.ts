import amqplib from 'amqplib'
import { env } from './env'
import type { OrderWorkflowInput } from './workflows/order'

async function assertTopology(channel: amqplib.Channel) {
  await channel.assertExchange(env.rabbitExchange, 'fanout', { durable: true })
  await channel.assertQueue(env.rabbitQueue, { durable: true })
  await channel.bindQueue(env.rabbitQueue, env.rabbitExchange, '')
}

export async function publishOrder(payload: OrderWorkflowInput) {
  const connection = await amqplib.connect(env.rabbitUrl)
  const channel = await connection.createChannel()

  try {
    await assertTopology(channel)
    const published = channel.publish(
      env.rabbitExchange,
      '',
      Buffer.from(JSON.stringify(payload)),
      {
        persistent: true,
      }
    )

    if (!published) {
      throw new Error('RabbitMQ rejected the publish')
    }
  } finally {
    await channel.close()
    await connection.close()
  }
}
