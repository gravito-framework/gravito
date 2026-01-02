export interface SystemMetrics {
  cpu: {
    usage: number
    cores: number
  }
  memory: {
    rss: number
    heapUsed: number
    total: number
    free: number
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
