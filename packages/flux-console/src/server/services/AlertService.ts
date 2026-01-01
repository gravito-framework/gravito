import { EventEmitter } from 'events'
import type { WorkerReport } from './QueueService'

export interface AlertRule {
  id: string
  name: string
  type: 'backlog' | 'failure' | 'worker_lost'
  threshold: number
  queue?: string // Optional: specific queue or all
  cooldownMinutes: number
}

export interface AlertEvent {
  ruleId: string
  timestamp: number
  message: string
  severity: 'warning' | 'critical'
}

export class AlertService {
  private rules: AlertRule[] = []
  private cooldowns: Map<string, number> = new Map()
  private webhookUrl: string | null = process.env.SLACK_WEBHOOK_URL || null
  private emitter = new EventEmitter()

  constructor() {
    // Default Rules
    this.rules = [
      {
        id: 'global_failure_spike',
        name: 'High Failure Rate',
        type: 'failure',
        threshold: 50, // More than 50 failed jobs
        cooldownMinutes: 30,
      },
      {
        id: 'global_backlog_critical',
        name: 'Queue Backlog Warning',
        type: 'backlog',
        threshold: 1000, // More than 1000 waiting jobs
        cooldownMinutes: 60,
      },
      {
        id: 'no_workers_online',
        name: 'All Workers Offline',
        type: 'worker_lost',
        threshold: 1, // < 1 worker
        cooldownMinutes: 15,
      },
    ]
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
   * Extremely lightweight: only uses existing metrics data.
   */
  async check(data: {
    queues: any[]
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
        case 'backlog':
          if (data.totals.waiting >= rule.threshold) {
            fired = true
            severity = 'critical'
            message = `Queue backlog detected: ${data.totals.waiting} jobs waiting across all queues.`
          }
          break

        case 'failure':
          if (data.totals.failed >= rule.threshold) {
            fired = true
            severity = 'warning'
            message = `High failure count: ${data.totals.failed} jobs are currently in failed state.`
          }
          break

        case 'worker_lost':
          if (data.workers.length < rule.threshold) {
            fired = true
            severity = 'critical'
            message = `System Incident: Zero worker nodes detected! Jobs will not be processed.`
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

  /**
   * Send notification to external channels.
   * Fire-and-forget to ensure zero impact on main loop latency.
   */
  private notify(event: AlertEvent) {
    if (!this.webhookUrl) return

    // Simple Slack formatting
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
