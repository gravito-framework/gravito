import { describe, expect, it, mock } from 'bun:test'
import { DevMailbox } from '../src/dev/DevMailbox'
import { Mailable } from '../src/Mailable'
import { OrbitSignal } from '../src/OrbitSignal'
import { MemoryTransport } from '../src/transports/MemoryTransport'

class DemoMail extends Mailable {
  build() {
    return this.from('from@example.com')
      .to('to@example.com')
      .cc('cc@example.com')
      .bcc('bcc@example.com')
      .replyTo('reply@example.com')
      .subject('Hello')
      .priority('high')
      .attach({ filename: 'file.txt', content: 'hi' })
      .html('<p>Hi</p>')
  }
}

describe('Mailable', () => {
  it('builds envelopes and renders content', async () => {
    const mail = new DemoMail()
    const envelope = await mail.buildEnvelope({
      from: { address: 'default@example.com' },
      translator: (key: string) => `t:${key}`,
    })

    expect(envelope.from?.address).toBe('from@example.com')
    expect(envelope.cc?.[0]?.address).toBe('cc@example.com')
    expect(envelope.bcc?.[0]?.address).toBe('bcc@example.com')
    expect(envelope.replyTo?.address).toBe('reply@example.com')

    const content = await mail.renderContent()
    expect(content.html).toContain('<p>Hi</p>')
    expect(content.text).toBe('Hi')
    expect(mail.t('hello')).toBe('t:hello')
  })

  it('queues mailables via OrbitSignal', async () => {
    const queueMock = mock(async () => {})
    const orbit = new OrbitSignal({
      transport: new MemoryTransport(new DevMailbox()),
    })
    ;(orbit as any).queueService = { push: queueMock }

    const mail = new DemoMail().onQueue('emails').onConnection('redis').delay(5)
    await mail.queue()
    expect(queueMock).toHaveBeenCalledWith(mail)
  })
})
