export interface PulseCpu {
  system: number // Percentage 0-100
  process: number // Percentage 0-100
  cores: number
}

export interface PulseMemory {
  system: {
    total: number // bytes
    free: number // bytes
    used: number // bytes
  }
  process: {
    rss: number // bytes
    heapTotal: number // bytes
    heapUsed: number // bytes
  }
}

export interface PulseRuntime {
  uptime: number // seconds
  framework: string // e.g. "Node 20.1", "Laravel 10.0"
}

export interface PulseNode {
  id: string // Unique Instance ID
  service: string // Group name
  language: 'node' | 'bun' | 'deno' | 'php' | 'go' | 'python' | 'other'
  version: string // App Version
  pid: number
  hostname: string
  platform: string
  cpu: PulseCpu
  memory: PulseMemory
  runtime: PulseRuntime
  timestamp: number // Last heartbeat
}
