export interface SystemMetrics {
  language?: 'node' | 'bun' | 'deno'
  cpu: {
    system: number // System-wide load %
    process: number // Process-specific load %
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
  runtime: {
    uptime: number
    platform: string
    version: string
  }
  pid: number
  hostname: string
}

export interface Probe {
  getMetrics(): Promise<SystemMetrics> | SystemMetrics
}
