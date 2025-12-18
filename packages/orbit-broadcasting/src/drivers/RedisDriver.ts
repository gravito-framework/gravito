import type { BroadcastDriver } from './BroadcastDriver'

/**
 * Redis 驅動配置
 */
export interface RedisDriverConfig {
  url?: string
  host?: string
  port?: number
  password?: string
  db?: number
  keyPrefix?: string
}

/**
 * Redis 驅動
 *
 * 通過 Redis Pub/Sub 進行廣播。
 * 需要 Redis 客戶端支援。
 */
export class RedisDriver implements BroadcastDriver {
  private redis: {
    publish(channel: string, message: string): Promise<number>
  } | null = null

  constructor(private config: RedisDriverConfig) {
    // Redis 客戶端應該由外部注入
    // 這裡僅提供介面
  }

  /**
   * 設置 Redis 客戶端
   */
  setRedisClient(client: { publish(channel: string, message: string): Promise<number> }): void {
    this.redis = client
  }

  async broadcast(
    channel: { name: string; type: string },
    event: string,
    data: Record<string, unknown>
  ): Promise<void> {
    if (!this.redis) {
      throw new Error('Redis client not set. Please install a Redis client and call setRedisClient()')
    }

    const prefix = this.config.keyPrefix || 'gravito:broadcast:'
    const channelName = `${prefix}${channel.name}`
    const message = JSON.stringify({
      event,
      data,
      channel: channel.name,
      type: channel.type,
    })

    await this.redis.publish(channelName, message)
  }
}

