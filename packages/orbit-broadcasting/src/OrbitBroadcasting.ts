import type { GravitoOrbit, PlanetCore } from 'gravito-core'
import { BroadcastManager } from './BroadcastManager'
import { AblyDriver } from './drivers/AblyDriver'
import type { AblyDriverConfig } from './drivers/AblyDriver'
import type { BroadcastDriver } from './drivers/BroadcastDriver'
import { PusherDriver } from './drivers/PusherDriver'
import type { PusherDriverConfig } from './drivers/PusherDriver'
import { RedisDriver } from './drivers/RedisDriver'
import type { RedisDriverConfig } from './drivers/RedisDriver'
import { WebSocketDriver } from './drivers/WebSocketDriver'
import type { WebSocketDriverConfig } from './drivers/WebSocketDriver'

/**
 * OrbitBroadcasting 配置選項
 */
export interface OrbitBroadcastingOptions {
  /**
   * 驅動類型
   */
  driver: 'pusher' | 'ably' | 'redis' | 'websocket'

  /**
   * 驅動配置
   */
  config:
    | PusherDriverConfig
    | AblyDriverConfig
    | RedisDriverConfig
    | WebSocketDriverConfig

  /**
   * 頻道授權回調（可選）
   */
  authorizeChannel?: (
    channel: string,
    socketId: string,
    userId?: string | number
  ) => Promise<boolean>
}

/**
 * Broadcasting Orbit
 *
 * 提供廣播系統功能，支援多種驅動（Pusher、Ably、Redis、WebSocket）。
 */
export class OrbitBroadcasting implements GravitoOrbit {
  private options: OrbitBroadcastingOptions

  constructor(options: OrbitBroadcastingOptions) {
    this.options = options
  }

  /**
   * 配置 OrbitBroadcasting
   */
  static configure(options: OrbitBroadcastingOptions): OrbitBroadcasting {
    return new OrbitBroadcasting(options)
  }

  async install(core: PlanetCore): Promise<void> {
    const manager = new BroadcastManager(core)

    // 創建並設置驅動
    let driver: BroadcastDriver

    switch (this.options.driver) {
      case 'pusher':
        driver = new PusherDriver(this.options.config as PusherDriverConfig)
        break
      case 'ably':
        driver = new AblyDriver(this.options.config as AblyDriverConfig)
        break
      case 'redis':
        driver = new RedisDriver(this.options.config as RedisDriverConfig)
        // 如果提供了 Redis 客戶端，設置它
        const redisClient = core.services.get('redis') as
          | { publish(channel: string, message: string): Promise<number> }
          | undefined
        if (redisClient) {
          driver.setRedisClient(redisClient)
        }
        break
      case 'websocket':
        driver = new WebSocketDriver(this.options.config as WebSocketDriverConfig)
        break
      default:
        throw new Error(`Unsupported broadcast driver: ${this.options.driver}`)
    }

    manager.setDriver(driver)

    // 設置授權回調
    if (this.options.authorizeChannel) {
      manager.setAuthCallback(this.options.authorizeChannel)
    }

    // 註冊到 core services
    core.services.set('broadcast', manager)

    // 整合到 EventManager
    if (core.events) {
      core.events.setBroadcastManager({
        broadcast: async (event, channel, data, eventName) => {
          await manager.broadcast(event, channel, data, eventName)
        },
      })
    }

    core.logger.info(`[OrbitBroadcasting] Installed with ${this.options.driver} driver`)
  }
}

