export interface QueueSnapshot {
  name: string
  driver: 'redis' | 'sqs' | 'rabbitmq'
  size: {
    waiting: number
    active: number
    failed: number
    delayed: number
  }
  throughput?: {
    in: number // jobs/min
    out: number // jobs/min
  }
}

export interface SystemMetrics {
  cpu: {
    system: number // Percentage 0-100
    process: number // Percentage 0-100
    cores: number
  }
  memory: {
    system: {
      total: number
      free: number
      used: number
    }
    process: {
      rss: number
      heapTotal: number
      heapUsed: number
    }
  }
  queues?: QueueSnapshot[]
  language?: 'node' | 'bun' | 'deno' | 'php' | 'go' | 'python' | 'other'
  version?: string
  pid: number
  hostname: string
  platform: string
  uptime: number
}

export interface Probe {
  getMetrics(): Promise<SystemMetrics> | SystemMetrics
}
