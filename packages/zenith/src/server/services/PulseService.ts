import { Redis } from 'ioredis'
import type { PulseNode } from '../../shared/types'

export class PulseService {
  private redis: Redis
  private prefix = 'pulse:'

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, {
      lazyConnect: true,
    })
  }

  async connect() {
    await this.redis.connect()
  }

  /**
   * Discovers active Pulse nodes using SCAN.
   */
  async getNodes(): Promise<Record<string, PulseNode[]>> {
    const nodes: PulseNode[] = []
    let cursor = '0'
    const now = Date.now()

    do {
      // Scan for pulse keys
      const result = await this.redis.scan(cursor, 'MATCH', `${this.prefix}*`, 'COUNT', 100)
      cursor = result[0]
      const keys = result[1]

      if (keys.length > 0) {
        // Fetch values
        const values = await this.redis.mget(...keys)

        values.forEach((v) => {
          if (v) {
            try {
              const node = JSON.parse(v) as PulseNode
              // Filter out stale nodes if TTL didn't catch them yet (grace period 60s)
              if (now - node.timestamp < 60000) {
                nodes.push(node)
              }
            } catch (_e) {
              // Ignore malformed
            }
          }
        })
      }
    } while (cursor !== '0')

    // Group by service
    const grouped: Record<string, PulseNode[]> = {}

    nodes.sort((a, b) => b.timestamp - a.timestamp) // Newest first

    for (const node of nodes) {
      if (!grouped[node.service]) {
        grouped[node.service] = []
      }
      grouped[node.service].push(node)
    }

    return grouped
  }

  /**
   * Manually record a heartbeat (for this Zenith server itself).
   */
  async recordHeartbeat(node: PulseNode): Promise<void> {
    const key = `${this.prefix}${node.service}:${node.id}`
    // TTL 30 seconds
    await this.redis.set(key, JSON.stringify(node), 'EX', 30)
  }
}
