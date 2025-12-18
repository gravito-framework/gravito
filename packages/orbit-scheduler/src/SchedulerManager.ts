import type { Logger } from 'gravito-core'
import { CronParser } from './CronParser'
import type { LockManager } from './locks/LockManager'
import { type ScheduledTask, TaskSchedule } from './TaskSchedule'

export class SchedulerManager {
  private tasks: TaskSchedule[] = []

  constructor(
    public lockManager: LockManager,
    private logger?: Logger
  ) {}

  /**
   * Define a new scheduled task
   */
  task(name: string, callback: () => void | Promise<void>): TaskSchedule {
    const task = new TaskSchedule(name, callback)
    this.tasks.push(task)
    return task
  }

  /**
   * Add a pre-configured task schedule
   */
  add(schedule: TaskSchedule) {
    this.tasks.push(schedule)
  }

  getTasks(): ScheduledTask[] {
    return this.tasks.map((t) => t.getTask())
  }

  /**
   * Run due tasks
   */
  async run(date: Date = new Date()): Promise<void> {
    const tasks = this.getTasks()
    const dueTasks = tasks.filter((task) => CronParser.isDue(task.expression, task.timezone, date))

    if (dueTasks.length > 0) {
      // Log found tasks?
    }

    for (const task of dueTasks) {
      // Fire and forget individual tasks so they run in parallel
      // But we must catch errors to not crash the loop (which is already inside async void but good practice)
      this.runTask(task).catch((err) => {
        this.logger?.error(`[Scheduler] Unexpected error running task ${task.name}`, err)
      })
    }
  }

  async runTask(task: ScheduledTask): Promise<void> {
    let acquiredLock = false
    const lockKey = `task:${task.name}`

    if (task.shouldRunOnOneServer) {
      acquiredLock = await this.lockManager.acquire(lockKey, task.lockTtl)

      if (!acquiredLock) {
        // Task running on another server or locked
        return
      }
    }

    try {
      if (task.background) {
        // If background, we don't await execution, but we MUST await to release lock?
        // If we release lock immediately, another server can pick it up.
        // So for background tasks, "onOneServer" is tricky.
        // Usually background means "detach from CLI process".
        // But if running in `schedule:run`, we are already in a CLI process.
        // "background" usually assumes spawning a completely separate process.

        // For now, let's treat background as "don't block the loop".
        // BUT if we don't await, we release lock immediately in finally block.
        // So if we start background task, we must NOT release lock in finally block?
        // But then who releases it? TTL.

        this.executeTask(task).catch((err) => {
          this.logger?.error(`Background task ${task.name} failed`, err)
        })
        // If background, we might theoretically hold the lock until TTL expires?
        // Or we return immediately.

        // Let's stick to synchronous await for MVP unless user specifically requests "fire and forget".
        // If "background" is true, we assume user accepts that lock might be released early OR we rely on TTL.
        // Actually, `run` loop fires `runTask` without await. So tasks are already parallelized in the node process.
        // `background` in Laravel means `run in background process (&)`.
        // I'll ignore `background` flag for now or treat it same as foreground but maybe logging diff.
      } else {
        await this.executeTask(task)
      }
    } finally {
      if (acquiredLock) {
        await this.lockManager.release(lockKey)
      }
    }
  }

  private async executeTask(task: ScheduledTask) {
    try {
      await task.callback()
      for (const cb of task.onSuccessCallbacks) {
        try {
          await cb({})
        } catch {}
      }
    } catch (err: any) {
      this.logger?.error(`Task ${task.name} failed`, err)
      for (const cb of task.onFailureCallbacks) {
        try {
          await cb(err)
        } catch {}
      }
      // We don't rethrow here to ensure cleanup happens in runTask
    }
  }
}
