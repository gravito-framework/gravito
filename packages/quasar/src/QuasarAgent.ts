import { Redis } from 'ioredis'
import { NodeProbe } from './probes/NodeProbe'
import type { Probe } from './types'

export interface QuasarOptions {
  service: string
  redisUrl?: string
  interval?: number
  probe?: Probe
}

export class QuasarAgent {
  private redis: Redis
  private service: string
  private interval: number
  private probe: Probe
  private timer: Timer | null = null
  private prefix = 'pulse:' // TODO: Migrate to gravito:quasar: later

  constructor(options: QuasarOptions) {
    this.service = options.service
    this.redis = new Redis(options.redisUrl || 'redis://localhost:6379', {
      lazyConnect: true,
    })
    this.interval = options.interval || 10000 // 10s default
    this.probe = options.probe || new NodeProbe()
  }

  async start() {
    await this.redis.connect()
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
    await this.redis.quit()
    console.log(`[Quasar] Agent stopped`)
  }

  private async tick() {
    try {
      const metrics = await this.probe.getMetrics()
      const id = `${metrics.hostname}-${metrics.pid}`

      const payload = {
        id,
        service: this.service,
        language: 'node',
        version: metrics.runtime.version,
        pid: metrics.pid,
        hostname: metrics.hostname,
        platform: metrics.runtime.platform,
        cpu: metrics.cpu,
        memory: metrics.memory,
        runtime: {
          uptime: metrics.runtime.uptime,
          framework: 'Quasar',
        },
        timestamp: Date.now(),
      }

      const key = `${this.prefix}${this.service}:${id}`
      await this.redis.set(key, JSON.stringify(payload), 'EX', 30)
    } catch (err) {
      console.error('[Quasar] Heartbeat failed:', err)
    }
  }
}
