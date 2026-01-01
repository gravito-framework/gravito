import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from 'react'

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: number
  read: boolean
  source?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearAll: () => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | null>(null)

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const unreadCount = notifications.filter((n) => !n.read).length

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      const newNotification: Notification = {
        ...notification,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        read: false,
      }
      setNotifications((prev) => [newNotification, ...prev].slice(0, 50)) // Keep max 50 notifications
    },
    []
  )

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }, [])

  // Subscribe to SSE log stream for real-time notifications
  useEffect(() => {
    let eventSource: EventSource | null = null

    const connect = () => {
      eventSource = new EventSource('/api/logs/stream')

      eventSource.addEventListener('log', (event) => {
        try {
          const log = JSON.parse(event.data)

          // Generate notifications for important events
          if (log.level === 'error' || log.level === 'warn') {
            addNotification({
              type: log.level === 'error' ? 'error' : 'warning',
              title: log.level === 'error' ? 'Job Failed' : 'Warning',
              message: log.message || 'An event occurred',
              source: log.queue || log.source,
            })
          }
        } catch (_e) {
          // Ignore parse errors
        }
      })

      eventSource.onerror = () => {
        eventSource?.close()
        // Reconnect after 5 seconds
        setTimeout(connect, 5000)
      }
    }

    connect()

    return () => {
      eventSource?.close()
    }
  }, [addNotification])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearAll,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}
