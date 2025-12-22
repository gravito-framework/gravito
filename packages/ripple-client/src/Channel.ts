/**
 * @fileoverview Channel classes for @gravito/ripple-client
 * @module @gravito/ripple-client
 */

import type { EventCallback, PresenceCallbacks, PresenceUser } from './types'

/**
 * Base channel class for event subscription
 */
export class Channel {
  protected listeners = new Map<string, Set<EventCallback>>()

  constructor(
    public readonly name: string,
    protected sendMessage: (msg: object) => void
  ) {}

  /**
   * Listen for an event on this channel
   */
  listen<T = unknown>(event: string, callback: EventCallback<T>): this {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set())
    }
    this.listeners.get(event)!.add(callback as EventCallback)
    return this
  }

  /**
   * Stop listening for an event
   */
  stopListening(event?: string, callback?: EventCallback): this {
    if (!event) {
      this.listeners.clear()
    } else if (!callback) {
      this.listeners.delete(event)
    } else {
      this.listeners.get(event)?.delete(callback)
    }
    return this
  }

  /**
   * Dispatch an event to all listeners
   * @internal
   */
  _dispatch(event: string, data: unknown): void {
    const callbacks = this.listeners.get(event)
    if (callbacks) {
      for (const callback of callbacks) {
        try {
          callback(data)
        } catch (e) {
          console.error('[Ripple] Error in event callback:', e)
        }
      }
    }
  }

  /**
   * Send a client event (whisper) to other subscribers
   */
  whisper(event: string, data: unknown): this {
    this.sendMessage({
      type: 'whisper',
      channel: this.name,
      event,
      data,
    })
    return this
  }
}

/**
 * Private channel - requires authentication
 */
export class PrivateChannel extends Channel {
  constructor(name: string, sendMessage: (msg: object) => void) {
    super(`private-${name}`, sendMessage)
  }
}

/**
 * Presence channel - tracks online users
 */
export class PresenceChannel extends Channel {
  private members: PresenceUser[] = []
  private presenceCallbacks: PresenceCallbacks = {}

  constructor(name: string, sendMessage: (msg: object) => void) {
    super(`presence-${name}`, sendMessage)
  }

  /**
   * Callback when receiving initial member list
   */
  here(callback: (users: PresenceUser[]) => void): this {
    this.presenceCallbacks.here = callback
    return this
  }

  /**
   * Callback when a user joins
   */
  joining(callback: (user: PresenceUser) => void): this {
    this.presenceCallbacks.joining = callback
    return this
  }

  /**
   * Callback when a user leaves
   */
  leaving(callback: (user: PresenceUser) => void): this {
    this.presenceCallbacks.leaving = callback
    return this
  }

  /**
   * Get current members
   */
  getMembers(): PresenceUser[] {
    return [...this.members]
  }

  /**
   * Handle presence events
   * @internal
   */
  _handlePresence(event: 'join' | 'leave' | 'members', data: unknown): void {
    switch (event) {
      case 'members':
        this.members = data as PresenceUser[]
        this.presenceCallbacks.here?.(this.members)
        break

      case 'join': {
        const joiningUser = data as PresenceUser
        this.members.push(joiningUser)
        this.presenceCallbacks.joining?.(joiningUser)
        break
      }

      case 'leave': {
        const leavingUser = data as PresenceUser
        this.members = this.members.filter((m) => m.id !== leavingUser.id)
        this.presenceCallbacks.leaving?.(leavingUser)
        break
      }
    }
  }
}
