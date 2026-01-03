import { EventEmitter } from 'events'
import { Redis } from 'ioredis'
import type { AlertEvent, AlertRule, PulseNode } from '../../shared/types'
import type { WorkerReport } from './QueueService'

export class AlertService {
  private redis: Redis
  private rules: AlertRule[] = []
  private cooldowns: Map<string, number> = new Map()
  private webhookUrl: string | null = process.env.SLACK_WEBHOOK_URL || null
  private emitter = new EventEmitter()
  private readonly RULES_KEY = 'gravito:zenith:alerts:rules'

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, {
      lazyConnect: true,
    })

    // Initial default rules
    this.rules = [
      {
        id: 'global_failure_spike',
        name: 'High Failure Rate',
        type: 'failure',
        threshold: 50,
        cooldownMinutes: 30,
      },
      {
        id: 'global_backlog_critical',
        name: 'Queue Backlog Warning',
        type: 'backlog',
        threshold: 1000,
        cooldownMinutes: 60,
      },
      {
        id: 'no_workers_online',
        name: 'All Workers Offline',
        type: 'worker_lost',
        threshold: 1,
        cooldownMinutes: 15,
      },
    ]

    this.loadRules().catch((err) => console.error('[AlertService] Failed to load rules:', err))
  }

  async connect() {
    if (this.redis.status === 'wait') {
      await this.redis.connect()
    }
  }

  async loadRules() {
    try {
      const data = await this.redis.get(this.RULES_KEY)
      if (data) {
        this.rules = JSON.parse(data)
      }
    } catch (err) {
      console.error('[AlertService] Error loading rules from Redis:', err)
    }
  }

  async saveRules(rules: AlertRule[]) {
    this.rules = rules
    await this.redis.set(this.RULES_KEY, JSON.stringify(rules))
  }

  async addRule(rule: AlertRule) {
    this.rules.push(rule)
    await this.saveRules(this.rules)
  }

  async deleteRule(id: string) {
    this.rules = this.rules.filter((r) => r.id !== id)
    await this.saveRules(this.rules)
  }

  setWebhook(url: string | null) {
    this.webhookUrl = url
  }

  onAlert(callback: (event: AlertEvent) => void) {
    this.emitter.on('alert', callback)
    return () => this.emitter.off('alert', callback)
  }

  /**
   * Evaluates rules against provided data.
   */
  async check(data: {
    queues: any[]
    nodes: Record<string, PulseNode[]>
    workers: WorkerReport[]
    totals: { waiting: number; delayed: number; failed: number }
  }) {
    const now = Date.now()

    for (const rule of this.rules) {
      // 1. Check Cool-down
      const lastFire = this.cooldowns.get(rule.id) || 0
      if (now - lastFire < rule.cooldownMinutes * 60 * 1000) {
        continue
      }

      let fired = false
      let message = ''
      let severity: 'warning' | 'critical' = 'warning'

      // 2. Evaluate Rule
      switch (rule.type) {
        case 'backlog': {
          const targetValue = rule.queue
            ? data.queues.find((q) => q.name === rule.queue)?.waiting || 0
            : data.totals.waiting

          if (targetValue >= rule.threshold) {
            fired = true
            severity = 'critical'
            message = rule.queue
              ? `Queue backlog on ${rule.queue}: ${targetValue} jobs waiting.`
              : `Queue backlog detected: ${targetValue} jobs waiting across all queues.`
          }
          break
        }

        case 'failure': {
          const targetValue = rule.queue
            ? data.queues.find((q) => q.name === rule.queue)?.failed || 0
            : data.totals.failed

          if (targetValue >= rule.threshold) {
            fired = true
            severity = 'warning'
            message = rule.queue
              ? `High failure count on ${rule.queue}: ${targetValue} jobs failed.`
              : `High failure count: ${targetValue} jobs are currently in failed state.`
          }
          break
        }

        case 'worker_lost':
          if (data.workers.length < rule.threshold) {
            fired = true
            severity = 'critical'
            message = `System Incident: Zero worker nodes detected! Jobs will not be processed.`
          }
          break

        case 'node_cpu':
          // Check all pulse nodes
          for (const serviceNodes of Object.values(data.nodes)) {
            for (const node of serviceNodes) {
              if (node.cpu.process >= rule.threshold) {
                fired = true
                severity = 'warning'
                message = `High CPU Usage on ${node.service} (${node.id}): ${node.cpu.process}%`
                break
              }
            }
            if (fired) break
          }
          break

        case 'node_ram':
          for (const serviceNodes of Object.values(data.nodes)) {
            for (const node of serviceNodes) {
              const usagePercent = (node.memory.process.rss / node.memory.system.total) * 100
              if (usagePercent >= rule.threshold) {
                fired = true
                severity = 'warning'
                message = `High RAM Usage on ${node.service} (${node.id}): ${usagePercent.toFixed(1)}%`
                break
              }
            }
            if (fired) break
          }
          break
      }

      // 3. Dispatch if fired
      if (fired) {
        this.cooldowns.set(rule.id, now)
        const event: AlertEvent = {
          ruleId: rule.id,
          timestamp: now,
          message,
          severity,
        }

        this.emitter.emit('alert', event)
        this.notify(event)
      }
    }
  }

  private notify(event: AlertEvent) {
    if (!this.webhookUrl) return

    const payload = {
      text: `*Flux Console Alert [${event.severity.toUpperCase()}]*\n${event.message}\n_Time: ${new Date(event.timestamp).toISOString()}_`,
      attachments: [
        {
          color: event.severity === 'critical' ? '#ef4444' : '#f59e0b',
          fields: [
            { title: 'Rule', value: event.ruleId, short: true },
            { title: 'Severity', value: event.severity, short: true },
          ],
        },
      ],
    }

    fetch(this.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((err) => {
      console.error('[AlertService] Failed to send notification:', err.message)
    })
  }

  getRules() {
    return this.rules
  }
}
