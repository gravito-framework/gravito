import os from 'node:os'
import process from 'node:process'
import type { PulseNode } from '../../shared/types'
import type { PulseService } from '../services/PulseService'

function getCpuUsage() {
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

let lastCpu = getCpuUsage()

export function startAgent(serviceName: string, pulseService: PulseService) {
  const HOSTNAME = os.hostname()
  const ID = `${HOSTNAME}-${process.pid}`
  const PLATFORM = os.platform()

  // Heartbeat Loop (every 10s)
  setInterval(async () => {
    try {
      // CPU Calc
      const currentCpu = getCpuUsage()
      const idleDiff = currentCpu.idle - lastCpu.idle
      const totalDiff = currentCpu.total - lastCpu.total
      const cpuPercent = totalDiff > 0 ? 100 - Math.round((idleDiff / totalDiff) * 100) : 0
      lastCpu = currentCpu

      // Memory
      const mem = process.memoryUsage()
      const sysTotal = os.totalmem()
      const sysFree = os.freemem()

      const pulse: PulseNode = {
        id: ID,
        service: serviceName,
        language: 'node',
        version: process.version,
        pid: process.pid,
        hostname: HOSTNAME,
        platform: PLATFORM,
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
          framework: 'Zenith Console',
        },
        timestamp: Date.now(),
      }

      await pulseService.recordHeartbeat(pulse)
    } catch (err) {
      console.error('[PulseAgent] Heartbeat failed:', err)
    }
  }, 10000)

  console.log(`[PulseAgent] Started monitoring for service: ${serviceName}`)
}
