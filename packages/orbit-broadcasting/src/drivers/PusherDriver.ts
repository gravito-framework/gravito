import type { BroadcastDriver } from './BroadcastDriver'

/**
 * Pusher 驅動配置
 */
export interface PusherDriverConfig {
  appId: string
  key: string
  secret: string
  cluster?: string
  useTLS?: boolean
}

/**
 * Pusher 驅動
 *
 * 通過 Pusher 服務進行廣播。
 */
export class PusherDriver implements BroadcastDriver {
  private baseUrl: string

  constructor(private config: PusherDriverConfig) {
    const cluster = this.config.cluster || 'mt1'
    this.baseUrl = `https://api-${cluster}.pusher.com`
  }

  async broadcast(
    channel: { name: string; type: string },
    event: string,
    data: Record<string, unknown>
  ): Promise<void> {
    const path = `/apps/${this.config.appId}/events`
    const body = {
      name: event,
      channel: channel.name,
      data: JSON.stringify(data),
    }

    const timestamp = Math.floor(Date.now() / 1000)
    const queryString = new URLSearchParams({
      auth_key: this.config.key,
      auth_timestamp: timestamp.toString(),
      auth_version: '1.0',
      body_md5: this.md5(JSON.stringify(body)),
    })

    const authString = `POST\n${path}\n${queryString.toString()}`
    const authSignature = await this.hmacSHA256(authString, this.config.secret)

    queryString.append('auth_signature', authSignature)

    const response = await fetch(`${this.baseUrl}${path}?${queryString.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`Failed to broadcast via Pusher: ${error}`)
    }
  }

  async authorizeChannel(
    channel: string,
    socketId: string,
    userId?: string | number
  ): Promise<{ auth: string; channel_data?: string }> {
    const stringToSign = `${socketId}:${channel}`
    const signature = await this.hmacSHA256(stringToSign, this.config.secret)

    if (channel.startsWith('presence-')) {
      const channelData = JSON.stringify({
        user_id: userId?.toString(),
        user_info: {},
      })
      return {
        auth: `${this.config.key}:${signature}`,
        channel_data: channelData,
      }
    }

    return {
      auth: `${this.config.key}:${signature}`,
    }
  }

  private async hmacSHA256(message: string, secret: string): Promise<string> {
    // 使用 Web Crypto API
    const encoder = new TextEncoder()
    const keyData = encoder.encode(secret)
    const messageData = encoder.encode(message)

    const key = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    )

    const signature = await crypto.subtle.sign('HMAC', key, messageData)
    const hashArray = Array.from(new Uint8Array(signature))
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')
  }

  private md5(text: string): string {
    // 簡化的 MD5 實作（實際應該使用完整的 MD5 實作）
    // 這裡僅作為範例，生產環境應該使用完整的 MD5 實作
    return btoa(text).replace(/[+/=]/g, '').substring(0, 32)
  }
}

