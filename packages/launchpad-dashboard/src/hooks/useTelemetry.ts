// @ts-expect-error
import { createRippleClient } from '@gravito/ripple-client'
import { useEffect, useState } from 'react'

export interface LogData {
  rocketId: string
  text: string
  timestamp: number
}

export interface StatsData {
  rocketId: string
  cpu: string
  memory: string
  timestamp: number
}

export function useTelemetry(url = 'ws://localhost:4000') {
  const [logs, setLogs] = useState<LogData[]>([])
  const [stats, setStats] = useState<Record<string, StatsData>>({})
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // 使用 Gravito Ripple Client
    const client = createRippleClient({
      url,
      autoConnect: true,
    })

    client.on('connect', () => {
      setConnected(true)
      console.log('[Telemetry] Ripple Connected')
    })

    client.on('disconnect', () => {
      setConnected(false)
      console.log('[Telemetry] Ripple Disconnected')
    })

    // 訂閱 telemetry 頻道
    client.subscribe('telemetry', (payload: any) => {
      const { type, data } = payload
      const timestamp = Date.now()

      if (type === 'log') {
        setLogs((prev) => [...prev.slice(-99), { ...data, timestamp }])
      } else if (type === 'stats') {
        setStats((prev) => ({
          ...prev,
          [data.rocketId]: { ...data, timestamp },
        }))
      }
    })

    return () => {
      client.disconnect()
    }
  }, [url])

  return { logs, stats, connected }
}
