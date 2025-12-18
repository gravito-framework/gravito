import { describe, expect, it } from 'bun:test'
import { ConsoleLogger, PlanetCore } from 'gravito-core'
import { BroadcastManager } from '../src'
import type { BroadcastDriver } from '../src'

describe('BroadcastManager', () => {
  it('should broadcast events through driver', async () => {
    const core = new PlanetCore({ logger: new ConsoleLogger() })
    const manager = new BroadcastManager(core)

    let broadcasted = false
    let broadcastedChannel = ''
    let broadcastedEvent = ''
    let broadcastedData: Record<string, unknown> = {}

    const mockDriver: BroadcastDriver = {
      broadcast: async (channel, event, data) => {
        broadcasted = true
        broadcastedChannel = channel.name
        broadcastedEvent = event
        broadcastedData = data
      },
    }

    manager.setDriver(mockDriver)

    await manager.broadcast(
      {},
      { name: 'test-channel', type: 'public' },
      { message: 'Hello' },
      'TestEvent'
    )

    expect(broadcasted).toBe(true)
    expect(broadcastedChannel).toBe('test-channel')
    expect(broadcastedEvent).toBe('TestEvent')
    expect(broadcastedData).toEqual({ message: 'Hello' })
  })

  it('should authorize channels', async () => {
    const core = new PlanetCore({ logger: new ConsoleLogger() })
    const manager = new BroadcastManager(core)

    manager.setDriver({
      broadcast: async () => { },
      authorizeChannel: async () => ({ auth: 'mock-auth' })
    })

    manager.setAuthCallback(async (channel, _socketId, userId) => {
      return channel === `private-user.${userId}`
    })

    const authorized = await manager.authorizeChannel('private-user.123', 'socket-123', '123')
    expect(authorized).not.toBeNull()

    const unauthorized = await manager.authorizeChannel('private-user.456', 'socket-123', '123')
    expect(unauthorized).toBeNull()
  })
})

