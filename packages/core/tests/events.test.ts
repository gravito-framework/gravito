import { describe, expect, it } from 'bun:test'
import { ConsoleLogger } from '../src/Logger'
import { PlanetCore } from '../src/PlanetCore'
import { Event, EventManager } from '../src'
import type { Listener } from '../src'

describe('EventManager', () => {
  it('should dispatch events to listeners', async () => {
    const core = new PlanetCore({ logger: new ConsoleLogger() })
    const events = core.events

    let handled = false

    class TestEvent extends Event {
      constructor(public message: string) {
        super()
      }
    }

    class TestListener implements Listener<TestEvent> {
      async handle(event: TestEvent): Promise<void> {
        handled = true
        expect(event.message).toBe('Hello')
      }
    }

    events.listen(TestEvent, new TestListener())

    await events.dispatch(new TestEvent('Hello'))

    expect(handled).toBe(true)
  })

  it('should support string event names', async () => {
    const core = new PlanetCore({ logger: new ConsoleLogger() })
    const events = core.events

    let handled = false

    class TestEvent extends Event {
      constructor(public message: string) {
        super()
      }
    }

    class TestListener implements Listener<TestEvent> {
      async handle(event: TestEvent): Promise<void> {
        handled = true
        expect(event.message).toBe('Hello')
      }
    }

    // 註冊字串事件名稱的監聽器
    events.listen('TestEvent', new TestListener())

    // 分發事件（會使用類別名稱 'TestEvent'）
    await events.dispatch(new TestEvent('Hello'))

    expect(handled).toBe(true)
  })

  it('should support ShouldBroadcast interface', () => {
    class BroadcastEvent extends Event {
      constructor(public data: string) {
        super()
      }

      broadcastOn(): string {
        return 'test-channel'
      }

      broadcastWith(): Record<string, unknown> {
        return { data: this.data }
      }
    }

    const event = new BroadcastEvent('test')
    expect(event.shouldBroadcast()).toBe(true)
    expect(event.getBroadcastChannel()).toBe('test-channel')
    expect(event.getBroadcastData()).toEqual({ data: 'test' })
  })
})

