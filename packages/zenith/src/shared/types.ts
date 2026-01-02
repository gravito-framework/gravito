export interface PulseCpu {
  usage: number // Percentage 0-100
  cores: number
}

export interface PulseMemory {
  rss: number // bytes
  heapUsed: number // bytes
  total: number // bytes
  free: number // bytes
}

export interface PulseRuntime {
  uptime: number // seconds
  framework: string // e.g. "Node 20.1", "Laravel 10.0"
}

export interface PulseNode {
  id: string // Unique Instance ID
  service: string // Group name
  language: 'node' | 'php' | 'go' | 'python' | 'other'
  version: string // App Version
  pid: number
  hostname: string
  platform: string
  cpu: PulseCpu
  memory: PulseMemory
  runtime: PulseRuntime
  timestamp: number // Last heartbeat
}
