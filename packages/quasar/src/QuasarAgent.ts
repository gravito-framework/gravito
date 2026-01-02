import { Redis } from 'ioredis'
import { NodeProbe } from './probes/NodeProbe'
import { RedisListProbe } from './probes/RedisListProbe'
import type { Probe, QueueProbe } from './types'

export interface RedisConfig {
  url?: string
  client?: Redis
  options?: any // ioredis options
}

export interface QuasarOptions {
  service: string
  name?: string

  // Connection to Zenith (for Heartbeat/Transport)
  transport?: RedisConfig
  // Connection to Local App (for Queue Monitoring)
  monitor?: RedisConfig
  // Legacy shorthand for transport
  redisUrl?: string

  interval?: number
  probe?: Probe
}

export class QuasarAgent {
  private transportRedis: Redis
  private monitorRedis?: Redis // Optional, only if monitoring queues

  private service: string
  private name?: string
  private interval: number
  private probe: Probe
  private queueProbes: QueueProbe[] = []
  private timer: Timer | null = null
  private prefix = 'gravito:quasar:node:'

  constructor(options: QuasarOptions) {
    this.service = options.service
    this.name = options.name

    // 1. Setup Transport Redis (Priority: transport.client > transport.url > redisUrl > default)
    if (options.transport?.client) {
      this.transportRedis = options.transport.client
    } else {
      const url = options.transport?.url || options.redisUrl || 'redis://localhost:6379'
      this.transportRedis = new Redis(url, {
        lazyConnect: true,
        ...(options.transport?.options || {}),
      })
    }

    // 2. Setup Monitor Redis (if provided)
    if (options.monitor) {
      if (options.monitor.client) {
        this.monitorRedis = options.monitor.client
      } else if (options.monitor.url) {
        this.monitorRedis = new Redis(options.monitor.url, {
          lazyConnect: true,
          ...(options.monitor.options || {}),
        })
      }
    }

    this.interval = options.interval || 10000 // 10s default
    this.probe = options.probe || new NodeProbe()
  }

  async start() {
    // Connect transport
    if (this.transportRedis.status !== 'ready' && this.transportRedis.status !== 'connecting') {
      await this.transportRedis.connect()
    }

    // Connect monitor if exists
    if (
      this.monitorRedis &&
      this.monitorRedis.status !== 'ready' &&
      this.monitorRedis.status !== 'connecting'
    ) {
      await this.monitorRedis.connect()
    }

    console.log(`[Quasar] Agent started for service: ${this.service}`)

    this.timer = setInterval(() => this.tick(), this.interval)
    // Initial tick
    await this.tick()
  }

  async stop() {
    if (this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }

    try {
      await this.transportRedis.quit()
      if (this.monitorRedis) {
        await this.monitorRedis.quit()
      }
    } catch (e) {
      console.error('[Quasar] Error stopping redis connections', e)
    }

    console.log(`[Quasar] Agent stopped`)
  }

  monitorQueue(name: string, type: 'redis' = 'redis') {
    if (!this.monitorRedis) {
      console.warn('[Quasar] Cannot monitor queue, no monitor connection provided.')
      return
    }

    if (type === 'redis') {
      this.queueProbes.push(new RedisListProbe(this.monitorRedis, name))
    }
  }

  private async tick() {
    try {
      const metrics = await this.probe.getMetrics()
      const hostname = this.name || metrics.hostname
      const id = `${hostname}-${metrics.pid}`

      // Collect queue snapshots
      const queues = await Promise.all(this.queueProbes.map((p) => p.getSnapshot()))

      const payload = {
        id,
        service: this.service,
        language: metrics.language || 'node',
        version: metrics.version,
        pid: metrics.pid,
        hostname: hostname,
        platform: metrics.platform,
        cpu: metrics.cpu,
        memory: metrics.memory,
        queues: queues.length > 0 ? queues : undefined,
        runtime: {
          uptime: metrics.uptime,
          framework: 'Quasar',
        },
        timestamp: Date.now(),
      }

      const key = `${this.prefix}${this.service}:${id}`
      await this.transportRedis.set(key, JSON.stringify(payload), 'EX', 30)
    } catch (err) {
      console.error('[Quasar] Heartbeat failed:', err)
    }
  }
}
