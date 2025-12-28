import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { DevMailbox } from '../src/dev/DevMailbox'
import { Mailable } from '../src/Mailable'
import { OrbitSignal } from '../src/OrbitSignal'
import { MemoryTransport } from '../src/transports/MemoryTransport'

class EmptyMail extends Mailable {
  build() {
    return this.html('<p>Hi</p>')
  }
}

describe('OrbitSignal', () => {
  beforeEach(() => {
    ;(OrbitSignal as any).instance = undefined
  })

  it('throws when instance is missing', () => {
    expect(() => OrbitSignal.getInstance()).toThrow(
      'OrbitSignal has not been initialized. Call OrbitSignal.configure() first.'
    )
  })

  it('falls back to LogTransport when missing', () => {
    const originalWarn = console.warn
    console.warn = mock(() => {})

    const instance = OrbitSignal.configure({})
    expect(instance).toBeInstanceOf(OrbitSignal)

    console.warn = originalWarn
  })

  it('sends messages via transport and validates fields', async () => {
    const mailboxTransport = new MemoryTransport(new DevMailbox())
    const orbit = new OrbitSignal({ transport: mailboxTransport })

    await expect(orbit.send(new EmptyMail())).rejects.toThrow('Message is missing "from"')

    class ValidMail extends Mailable {
      build() {
        return this.from('from@example.com').to('to@example.com').html('<p>Hi</p>')
      }
    }

    await expect(orbit.send(new ValidMail())).resolves.toBeUndefined()
  })

  it('queues immediately when no queue service is present', async () => {
    const transport = new MemoryTransport(new DevMailbox())
    const orbit = new OrbitSignal({ transport })

    const originalWarn = console.warn
    console.warn = mock(() => {})

    class ValidMail extends Mailable {
      build() {
        return this.from('from@example.com').to('to@example.com').html('<p>Hi</p>')
      }
    }

    await orbit.queue(new ValidMail())
    expect((console.warn as any).mock.calls.length).toBeGreaterThan(0)

    console.warn = originalWarn
  })
})
