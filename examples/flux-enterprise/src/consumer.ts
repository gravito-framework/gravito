import amqplib from 'amqplib'
import { env } from './env'
import { createFluxEngine, orderWorkflow } from './flux'

async function main() {
  const engine = createFluxEngine()
  const connection = await amqplib.connect(env.rabbitUrl)
  const channel = await connection.createChannel()

  await channel.assertExchange(env.rabbitExchange, 'fanout', { durable: true })
  await channel.assertQueue(env.rabbitQueue, { durable: true })
  await channel.bindQueue(env.rabbitQueue, env.rabbitExchange, '')

  console.log(`Consumer connected to ${env.rabbitUrl}, waiting for orders...`)

  await channel.consume(
    env.rabbitQueue,
    async (msg: any) => {
      if (!msg) return
      let payload: any

      try {
        payload = JSON.parse(msg.content.toString())
      } catch (error) {
        console.error('Invalid payload', error)
        channel.reject(msg, false)
        return
      }

      try {
        const result = await engine.execute(orderWorkflow, payload)
        console.log(`Workflow ${result.status} for ${payload.orderId}`)
        channel.ack(msg)
      } catch (error) {
        console.error('Workflow failed:', error)
        channel.nack(msg, false, true)
      }
    },
    { noAck: false }
  )

  process.on('SIGINT', async () => {
    await channel.close()
    await connection.close()
    process.exit(0)
  })
}

main().catch((error) => {
  console.error('Consumer crashed', error)
  process.exit(1)
})
