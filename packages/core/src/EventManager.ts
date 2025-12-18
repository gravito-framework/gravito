import type { PlanetCore } from './PlanetCore'
import type { Event, Listener, ShouldQueue } from './types/events'

/**
 * 監聽器註冊資訊
 */
interface ListenerRegistration<TEvent extends Event = Event> {
  listener: Listener<TEvent> | (new () => Listener<TEvent>)
  queue?: string
  connection?: string
  delay?: number
}

/**
 * 事件管理器
 *
 * 提供類型安全的事件分發和監聽器註冊功能。
 * 支援同步和異步（隊列）監聽器。
 *
 * @example
 * ```typescript
 * class UserRegistered extends Event {
 *   constructor(public user: User) {
 *     super()
 *   }
 * }
 *
 * class SendWelcomeEmail implements Listener<UserRegistered> {
 *   async handle(event: UserRegistered): Promise<void> {
 *     // 發送歡迎郵件
 *   }
 * }
 *
 * // 註冊監聽器
 * core.events.listen(UserRegistered, SendWelcomeEmail)
 *
 * // 分發事件
 * await core.events.dispatch(new UserRegistered(user))
 * ```
 */
export class EventManager {
  /**
   * 監聽器映射表
   * Key: 事件類別或事件名稱
   * Value: 監聽器註冊資訊陣列
   */
  private listeners = new Map<string | (new () => Event), ListenerRegistration[]>()

  /**
   * 廣播管理器（可選，由 orbit-broadcasting 注入）
   */
  private broadcastManager?: {
    broadcast(event: Event, channel: string | { name: string; type: string }, data: Record<string, unknown>, eventName: string): Promise<void>
  }

  /**
   * 隊列管理器（可選，由 orbit-queue 注入）
   */
  private queueManager?: {
    push(job: unknown, queue?: string, connection?: string, delay?: number): Promise<void>
  }

  constructor(private core: PlanetCore) {}

  /**
   * 註冊廣播管理器
   * 由 orbit-broadcasting 調用
   */
  setBroadcastManager(manager: EventManager['broadcastManager']): void {
    this.broadcastManager = manager
  }

  /**
   * 註冊隊列管理器
   * 由 orbit-queue 調用
   */
  setQueueManager(manager: EventManager['queueManager']): void {
    this.queueManager = manager
  }

  /**
   * 註冊事件監聽器
   *
   * @param event - 事件類別或事件名稱
   * @param listener - 監聽器實例或監聽器類別
   * @param options - 可選配置（用於隊列化）
   *
   * @example
   * ```typescript
   * // 同步監聽器
   * core.events.listen(UserRegistered, SendWelcomeEmail)
   *
   * // 異步監聽器（隊列化）
   * core.events.listen(UserRegistered, SendWelcomeEmail, {
   *   queue: 'emails',
   *   delay: 60
   * })
   * ```
   */
  listen<TEvent extends Event>(
    event: string | (new (...args: unknown[]) => TEvent),
    listener: Listener<TEvent> | (new () => Listener<TEvent>),
    options?: {
      queue?: string
      connection?: string
      delay?: number
    }
  ): void {
    const eventKey = typeof event === 'string' ? event : event
    if (!this.listeners.has(eventKey)) {
      this.listeners.set(eventKey, [])
    }

    const registration: ListenerRegistration<TEvent> = {
      listener,
      ...options,
    }

    this.listeners.get(eventKey)!.push(registration)
  }

  /**
   * 移除事件監聽器
   *
   * @param event - 事件類別或事件名稱
   * @param listener - 要移除的監聽器
   */
  unlisten<TEvent extends Event>(
    event: string | (new (...args: unknown[]) => TEvent),
    listener: Listener<TEvent> | (new () => Listener<TEvent>)
  ): void {
    const eventKey = typeof event === 'string' ? event : event
    const registrations = this.listeners.get(eventKey)
    if (!registrations) return

    const filtered = registrations.filter((reg) => reg.listener !== listener)
    if (filtered.length === 0) {
      this.listeners.delete(eventKey)
    } else {
      this.listeners.set(eventKey, filtered)
    }
  }

  /**
   * 分發事件
   *
   * 執行所有註冊的監聽器。如果監聽器實作了 ShouldQueue 介面或指定了隊列選項，
   * 則會將監聽器推送到隊列中異步執行。
   *
   * @param event - 事件實例
   *
   * @example
   * ```typescript
   * await core.events.dispatch(new UserRegistered(user))
   * ```
   */
  async dispatch<TEvent extends Event>(event: TEvent): Promise<void> {
    const eventKey = event.constructor
    const eventName = event.constructor.name

    // 觸發 hooks（向後相容）
    await this.core.hooks.doAction(`event:${eventName}`, event)
    await this.core.hooks.doAction('event:dispatched', { event, eventName })

    // 處理廣播
    if (event instanceof Event && event.shouldBroadcast() && this.broadcastManager) {
      const channel = event.getBroadcastChannel()
      if (channel) {
        const channelName = typeof channel === 'string' ? channel : channel.name
        const channelType = typeof channel === 'string' ? 'public' : channel.type
        const data = event.getBroadcastData()
        const broadcastEventName = event.getBroadcastEventName()

        await this.broadcastManager
          .broadcast(event, { name: channelName, type: channelType }, data, broadcastEventName)
          .catch((error) => {
            this.core.logger.error(`[EventManager] Failed to broadcast event ${eventName}:`, error)
          })
      }
    }

    // 獲取監聽器（先檢查類別，再檢查字串名稱）
    const registrations = this.listeners.get(eventKey) || []
    const stringRegistrations = this.listeners.get(eventName) || []
    const allRegistrations = [...registrations, ...stringRegistrations]

    // 執行監聽器
    for (const registration of allRegistrations) {
      try {
        // 解析監聽器實例
        let listenerInstance: Listener<TEvent>
        if (typeof registration.listener === 'function') {
          // 是類別，需要實例化
          listenerInstance = new registration.listener() as Listener<TEvent>
        } else {
          // 已經是實例
          listenerInstance = registration.listener as Listener<TEvent>
        }

        // 檢查是否應該隊列化
        const shouldQueue =
          'queue' in listenerInstance ||
          registration.queue !== undefined ||
          registration.connection !== undefined ||
          registration.delay !== undefined

        if (shouldQueue && this.queueManager) {
          // 推送到隊列
          const queue = (listenerInstance as unknown as ShouldQueue).queue || registration.queue
          const connection =
            (listenerInstance as unknown as ShouldQueue).connection || registration.connection
          const delay = (listenerInstance as unknown as ShouldQueue).delay || registration.delay

          // 創建隊列任務包裝器
          const queueJob = {
            type: 'event-listener',
            event: eventName,
            listener: listenerInstance.constructor.name,
            eventData: this.serializeEvent(event),
            handle: async () => {
              await listenerInstance.handle(event)
            },
          }

          await this.queueManager.push(queueJob, queue, connection, delay)
        } else {
          // 同步執行
          await listenerInstance.handle(event)
        }
      } catch (error) {
        this.core.logger.error(
          `[EventManager] Error in listener for event ${eventName}:`,
          error
        )
        // 繼續執行其他監聽器
      }
    }
  }

  /**
   * 序列化事件（用於隊列化）
   */
  private serializeEvent(event: Event): Record<string, unknown> {
    const data: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(event)) {
      if (!key.startsWith('_') && typeof value !== 'function') {
        data[key] = value
      }
    }
    return data
  }

  /**
   * 獲取所有註冊的監聽器
   */
  getListeners(event?: string | (new () => Event)): ListenerRegistration[] {
    if (event) {
      const eventKey = typeof event === 'string' ? event : event
      return this.listeners.get(eventKey) || []
    }
    const all: ListenerRegistration[] = []
    for (const registrations of this.listeners.values()) {
      all.push(...registrations)
    }
    return all
  }

  /**
   * 清除所有監聽器
   */
  clear(): void {
    this.listeners.clear()
  }
}

