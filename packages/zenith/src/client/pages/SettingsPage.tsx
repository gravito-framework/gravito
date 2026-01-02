import { useQuery } from '@tanstack/react-query'
import {
  Bell,
  Clock,
  Database,
  ExternalLink,
  Info,
  Monitor,
  Moon,
  Palette,
  RefreshCcw,
  Server,
  Shield,
  Sun,
  Trash2,
} from 'lucide-react'
import React from 'react'
import { cn } from '../utils'

export function SettingsPage() {
  const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('theme')
      if (stored === 'light' || stored === 'dark') {
        return stored
      }
    }
    return 'system'
  })

  const { data: systemStatus } = useQuery<any>({
    queryKey: ['system-status'],
    queryFn: () => fetch('/api/system/status').then((res) => res.json()),
    refetchInterval: 30000,
  })

  const { data: alertConfig } = useQuery<any>({
    queryKey: ['alerts-config'],
    queryFn: () => fetch('/api/alerts/config').then((res) => res.json()),
  })

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme)
    const root = window.document.documentElement

    if (newTheme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      if (prefersDark) {
        root.classList.add('dark')
      } else {
        root.classList.remove('dark')
      }
      localStorage.removeItem('theme')
    } else if (newTheme === 'dark') {
      root.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      root.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-black tracking-tighter">Settings</h1>
        <p className="text-muted-foreground mt-2 text-sm font-bold opacity-60 uppercase tracking-widest">
          Configure your Flux Console preferences.
        </p>
      </div>

      {/* Appearance Section */}
      <section className="card-premium p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Palette size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Appearance</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              Customize the look and feel
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold mb-3 block">Theme</label>
            <div className="flex gap-3">
              {[
                { value: 'light', icon: Sun, label: 'Light' },
                { value: 'dark', icon: Moon, label: 'Dark' },
                { value: 'system', icon: Monitor, label: 'System' },
              ].map(({ value, icon: Icon, label }) => (
                <button
                  key={value}
                  onClick={() => handleThemeChange(value as 'light' | 'dark' | 'system')}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all',
                    theme === value
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-muted/40 border-border/50 hover:border-primary/30'
                  )}
                >
                  <Icon size={18} />
                  <span className="font-bold text-sm">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Connection Info Section */}
      <section className="card-premium p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
            <Database size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Connection Status</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              Redis and system connectivity
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border/30">
            <div className="flex items-center gap-3">
              <Server size={16} className="text-muted-foreground" />
              <span className="font-medium">Redis Connection</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-bold text-green-500">Connected</span>
            </div>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border/30">
            <div className="flex items-center gap-3">
              <Database size={16} className="text-muted-foreground" />
              <span className="font-medium">Redis URL</span>
            </div>
            <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
              {process.env.REDIS_URL || 'redis://localhost:6379'}
            </code>
          </div>

          <div className="flex items-center justify-between py-3 border-b border-border/30">
            <div className="flex items-center gap-3">
              <Clock size={16} className="text-muted-foreground" />
              <span className="font-medium">Server Uptime</span>
            </div>
            <span className="text-sm font-mono font-bold">
              {systemStatus?.uptime ? formatUptime(systemStatus.uptime) : 'Loading...'}
            </span>
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <RefreshCcw size={16} className="text-muted-foreground" />
              <span className="font-medium">Engine Version</span>
            </div>
            <span className="text-sm font-bold">{systemStatus?.engine || 'Loading...'}</span>
          </div>
        </div>
      </section>

      {/* System Info Section */}
      <section className="card-premium p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
            <Info size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold">System Information</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              Runtime and memory details
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-muted/20 rounded-xl p-4">
            <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">
              Node.js Version
            </p>
            <p className="text-lg font-mono font-bold">{systemStatus?.node || '...'}</p>
          </div>
          <div className="bg-muted/20 rounded-xl p-4">
            <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">
              Environment
            </p>
            <p className="text-lg font-mono font-bold">{systemStatus?.env || '...'}</p>
          </div>
          <div className="bg-muted/20 rounded-xl p-4">
            <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">
              Memory (RSS)
            </p>
            <p className="text-lg font-mono font-bold">{systemStatus?.memory?.rss || '...'}</p>
          </div>
          <div className="bg-muted/20 rounded-xl p-4">
            <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">
              Heap Used
            </p>
            <p className="text-lg font-mono font-bold">{systemStatus?.memory?.heapUsed || '...'}</p>
          </div>
        </div>
      </section>

      {/* Alerting Section */}
      <section className="card-premium p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500">
            <Bell size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Alerting & Notifications</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              System health and failure monitoring
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between py-3 border-b border-border/30">
            <div>
              <h3 className="text-sm font-bold">Slack Webhook</h3>
              <p className="text-xs text-muted-foreground">
                Current status of notification integration.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'w-2 h-2 rounded-full',
                  alertConfig?.webhookEnabled
                    ? 'bg-green-500 animate-pulse'
                    : 'bg-muted-foreground/30'
                )}
              ></span>
              <span
                className={cn(
                  'text-sm font-bold',
                  alertConfig?.webhookEnabled ? 'text-green-500' : 'text-muted-foreground'
                )}
              >
                {alertConfig?.webhookEnabled ? 'Enabled' : 'Not Configured'}
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground/60 mb-3">
              Active Rules
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {alertConfig?.rules?.map((rule: any) => (
                <div
                  key={rule.id}
                  className="p-3 bg-muted/20 border border-border/10 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-tight">{rule.name}</p>
                    <p className="text-[10px] text-muted-foreground opacity-70">
                      {rule.type === 'backlog'
                        ? `Waiting > ${rule.threshold}`
                        : rule.type === 'failure'
                          ? `Failed > ${rule.threshold}`
                          : `Workers < ${rule.threshold}`}
                    </p>
                  </div>
                  <div className="px-2 py-0.5 bg-muted rounded text-[9px] font-bold text-muted-foreground">
                    {rule.cooldownMinutes}m cooldown
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground max-w-md">
              Configure <code>SLACK_WEBHOOK_URL</code> in your environment variables to receive
              notifications.
            </p>
            <button
              onClick={async () => {
                const res = await fetch('/api/alerts/test', { method: 'POST' }).then((r) =>
                  r.json()
                )
                if (res.success) {
                  alert('Test alert dispatched to server processing loop.')
                }
              }}
              disabled={!alertConfig?.webhookEnabled}
              className="w-full sm:w-auto px-4 py-2 border border-primary/20 hover:bg-primary/5 text-primary rounded-lg text-xs font-black uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
            >
              Test Notification
            </button>
          </div>
        </div>
      </section>

      {/* Data Retention Section */}
      <section className="card-premium p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
            <Trash2 size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold">Data Retention</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              Manage persistent archive storage
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold">SQL Job Archive Preservation</h3>
                <p className="text-xs text-muted-foreground">
                  Keep archived jobs for a specific number of days before permanent removal.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase text-muted-foreground/40 mr-2">
                  Retention Period
                </span>
                <select
                  className="bg-muted border border-border/50 rounded-lg px-3 py-1.5 text-sm font-bold outline-none focus:ring-1 focus:ring-primary/30 transition-all cursor-pointer"
                  defaultValue="30"
                  id="retention-days"
                >
                  <option value="7">7 Days</option>
                  <option value="15">15 Days</option>
                  <option value="30">30 Days</option>
                  <option value="90">90 Days</option>
                  <option value="365">1 Year</option>
                </select>
              </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/10 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Info size={16} className="text-red-500/60" />
                <span className="text-xs font-medium text-red-900/60 dark:text-red-400/60">
                  Manual prune will remove all jobs older than the selected period.
                </span>
              </div>
              <button
                onClick={async () => {
                  const days = (document.getElementById('retention-days') as HTMLSelectElement)
                    .value
                  if (confirm(`Are you sure you want to prune logs older than ${days} days?`)) {
                    const res = await fetch('/api/maintenance/cleanup-archive', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ days: parseInt(days, 10) }),
                    }).then((r) => r.json())
                    alert(`Cleanup complete. Removed ${res.deleted || 0} archived jobs.`)
                  }
                }}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-500/20"
              >
                Prune Archive Now
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-border/30">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold">Live Stats History (Redis)</h3>
                <p className="text-xs text-muted-foreground">
                  Minute-by-minute metrics used for dashboard charts.
                </p>
              </div>
              <div className="px-3 py-1 bg-muted rounded-full text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                Auto-Prunes (60m)
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="card-premium p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
            <Shield size={20} />
          </div>
          <div>
            <h2 className="text-lg font-bold">About Flux Console</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              Version and documentation
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b border-border/30">
            <span className="font-medium">Version</span>
            <span className="text-sm font-bold">0.1.0-alpha.1</span>
          </div>
          <div className="flex items-center justify-between py-3 border-b border-border/30">
            <span className="font-medium">Package</span>
            <code className="text-sm bg-muted px-2 py-1 rounded font-mono">
              @gravito/flux-console
            </code>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="font-medium">Documentation</span>
            <a
              href="https://github.com/gravito-framework/gravito"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-sm text-primary hover:underline font-bold"
            >
              View Docs <ExternalLink size={14} />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}

function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m ${Math.floor(seconds % 60)}s`
}
