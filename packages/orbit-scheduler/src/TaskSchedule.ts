import type { ActionCallback } from 'gravito-core'

export interface ScheduledTask {
  name: string
  expression: string
  timezone: string
  callback: () => void | Promise<void>
  shouldRunOnOneServer: boolean
  lockTtl: number // seconds
  background: boolean

  onSuccessCallbacks: ActionCallback[]
  onFailureCallbacks: ActionCallback[]
}

export class TaskSchedule {
  private task: ScheduledTask

  constructor(name: string, callback: () => void | Promise<void>) {
    this.task = {
      name,
      callback,
      expression: '* * * * *', // Default every minute
      timezone: 'UTC',
      shouldRunOnOneServer: false,
      lockTtl: 300, // 5 minutes default
      background: false, // Wait for task to finish by default
      onSuccessCallbacks: [],
      onFailureCallbacks: [],
    }
  }

  // --- Frequency Methods ---

  cron(expression: string): this {
    this.task.expression = expression
    return this
  }

  everyMinute(): this {
    return this.cron('* * * * *')
  }

  everyFiveMinutes(): this {
    return this.cron('*/5 * * * *')
  }

  everyTenMinutes(): this {
    return this.cron('*/10 * * * *')
  }

  everyFifteenMinutes(): this {
    return this.cron('*/15 * * * *')
  }

  everyThirtyMinutes(): this {
    return this.cron('0,30 * * * *')
  }

  hourly(): this {
    return this.cron('0 * * * *')
  }

  hourlyAt(minute: number): this {
    return this.cron(`${minute} * * * *`)
  }

  daily(): this {
    return this.cron('0 0 * * *')
  }

  dailyAt(time: string): this {
    const [hour, minute] = time.split(':')
    return this.cron(`${Number(minute)} ${Number(hour)} * * *`)
  }

  weekly(): this {
    return this.cron('0 0 * * 0')
  }

  weeklyOn(day: number, time = '00:00'): this {
    const [hour, minute] = time.split(':')
    return this.cron(`${Number(minute)} ${Number(hour)} * * ${day}`)
  }

  monthly(): this {
    return this.cron('0 0 1 * *')
  }

  monthlyOn(day: number, time = '00:00'): this {
    const [hour, minute] = time.split(':')
    return this.cron(`${Number(minute)} ${Number(hour)} ${day} * *`)
  }

  // --- Constraints ---

  timezone(timezone: string): this {
    this.task.timezone = timezone
    return this
  }

  at(time: string): this {
    const [hour, minute] = time.split(':')
    const parts = this.task.expression.split(' ')
    if (parts.length >= 5) {
      parts[0] = String(Number(minute))
      parts[1] = String(Number(hour))
      this.task.expression = parts.join(' ')
    }
    return this
  }

  /**
   * Ensure task runs on only one server at a time
   * @param lockTtlSeconds Time in seconds to hold the lock
   */
  onOneServer(lockTtlSeconds = 300): this {
    this.task.shouldRunOnOneServer = true
    this.task.lockTtl = lockTtlSeconds
    return this
  }

  /**
   * Alias for onOneServer
   */
  withoutOverlapping(expiresAt = 300): this {
    return this.onOneServer(expiresAt)
  }

  runInBackground(): this {
    this.task.background = true
    return this
  }

  // --- Hooks ---

  onSuccess(callback: ActionCallback): this {
    this.task.onSuccessCallbacks.push(callback)
    return this
  }

  onFailure(callback: ActionCallback): this {
    this.task.onFailureCallbacks.push(callback)
    return this
  }

  description(text: string): this {
    // Description logic if we want to store it (currently not in ScheduledTask interface but useful for CLI)
    // For now we just return this
    return this
  }

  // --- Accessor ---

  getTask(): ScheduledTask {
    return this.task
  }
}
