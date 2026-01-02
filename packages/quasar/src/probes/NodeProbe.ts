import os from 'node:os'
import process from 'node:process'
import type { Probe, SystemMetrics } from '../types'

export class NodeProbe implements Probe {
  private lastCpu: { idle: number; total: number; count: number }

  constructor() {
    this.lastCpu = this.getCpuUsage()
  }

  private getCpuUsage() {
    const cpus = os.cpus()
    const total = cpus.reduce((acc, cpu) => {
      return acc + Object.values(cpu.times).reduce((a, b) => a + b, 0)
    }, 0)
    const idle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0)

    return {
      total,
      idle,
      count: cpus.length,
    }
  }

  getMetrics(): SystemMetrics {
    // 1. CPU Calculation
    const currentCpu = this.getCpuUsage()
    const idleDiff = currentCpu.idle - this.lastCpu.idle
    const totalDiff = currentCpu.total - this.lastCpu.total
    const cpuPercent = totalDiff > 0 ? 100 - Math.round((idleDiff / totalDiff) * 100) : 0
    this.lastCpu = currentCpu

    // 2. Memory
    const mem = process.memoryUsage()
    const sysTotal = os.totalmem()
    const sysFree = os.freemem()

    return {
      cpu: {
        usage: cpuPercent,
        cores: currentCpu.count,
      },
      memory: {
        rss: mem.rss,
        heapUsed: mem.heapUsed,
        total: sysTotal,
        free: sysFree,
      },
      runtime: {
        uptime: process.uptime(),
        platform: os.platform(),
        version: process.version,
      },
      pid: process.pid,
      hostname: os.hostname(),
    }
  }
}
