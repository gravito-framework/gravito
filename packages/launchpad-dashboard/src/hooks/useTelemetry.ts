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
    let ws: WebSocket
    let reconnectTimer: any

    const connect = () => {
      ws = new WebSocket(url)

      ws.onopen = () => {
        setConnected(true)
        console.log('[Telemetry] Connected')
      }

      ws.onclose = () => {
        setConnected(false)
        console.log('[Telemetry] Disconnected, reconnecting...')
        reconnectTimer = setTimeout(connect, 3000)
      }

      ws.onmessage = (event) => {
        try {
          const { type, data } = JSON.parse(event.data)
          const timestamp = Date.now()

          if (type === 'log') {
            setLogs((prev) => [...prev.slice(-99), { ...data, timestamp }])
          } else if (type === 'stats') {
            setStats((prev) => ({
              ...prev,
              [data.rocketId]: { ...data, timestamp },
            }))
          }
        } catch (e) {
          console.error('Parse error', e)
        }
      }
    }

    connect()

    return () => {
      ws?.close()
      clearTimeout(reconnectTimer)
    }
  }, [url])

  return { logs, stats, connected }
}
