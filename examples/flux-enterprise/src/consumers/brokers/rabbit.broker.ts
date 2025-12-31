import type { Channel, ChannelModel, Connection } from 'amqplib'
import amqplib from 'amqplib'
import type { BrokerConfig, BrokerMessage, MessageBroker } from '../types'

export class RabbitBroker implements MessageBroker {
  private connection?: ChannelModel
  private channel?: Channel

  constructor(private url: string) {}

  async connect() {
    this.connection = await amqplib.connect(this.url)
    this.channel = await this.connection.createChannel()
  }

  async subscribe(config: BrokerConfig, callback: (msg: BrokerMessage) => Promise<void>) {
    if (!this.channel) throw new Error('Channel not initialized')

    if (config.exchange) {
      await this.channel.assertExchange(config.exchange, 'fanout', { durable: true })
      await this.channel.assertQueue(config.queue, { durable: true })
      await this.channel.bindQueue(config.queue, config.exchange, '')
    } else {
      await this.channel.assertQueue(config.queue, { durable: true })
    }

    await this.channel.consume(config.queue, async (rawMsg) => {
      if (!rawMsg) return

      await callback({
        content: rawMsg.content.toString(),
        raw: rawMsg,
      })
    })
  }

  async ack(msg: BrokerMessage) {
    this.channel?.ack(msg.raw)
  }

  async nack(msg: BrokerMessage, requeue: boolean) {
    this.channel?.nack(msg.raw, false, requeue)
  }

  async reject(msg: BrokerMessage, requeue: boolean) {
    this.channel?.reject(msg.raw, requeue)
  }

  async close() {
    await this.channel?.close()
    await this.connection?.close()
  }
}
