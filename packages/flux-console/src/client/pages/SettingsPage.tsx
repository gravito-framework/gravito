import React from 'react'
import { useQuery } from '@tanstack/react-query'
import {
    Database,
    Shield,
    Palette,
    Sun,
    Moon,
    Monitor,
    Clock,
    Server,
    RefreshCcw,
    Info,
    ExternalLink
} from 'lucide-react'
import { cn } from '../utils'

export function SettingsPage() {
    const [theme, setTheme] = React.useState<'light' | 'dark' | 'system'>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('theme')
            if (stored === 'light' || stored === 'dark') return stored
        }
        return 'system'
    })

    const { data: systemStatus } = useQuery<any>({
        queryKey: ['system-status'],
        queryFn: () => fetch('/api/system/status').then(res => res.json()),
        refetchInterval: 30000
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
                <p className="text-muted-foreground mt-2 text-sm font-bold opacity-60 uppercase tracking-widest">Configure your Flux Console preferences.</p>
            </div>

            {/* Appearance Section */}
            <section className="card-premium p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                        <Palette size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold">Appearance</h2>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Customize the look and feel</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-bold mb-3 block">Theme</label>
                        <div className="flex gap-3">
                            {[
                                { value: 'light', icon: Sun, label: 'Light' },
                                { value: 'dark', icon: Moon, label: 'Dark' },
                                { value: 'system', icon: Monitor, label: 'System' }
                            ].map(({ value, icon: Icon, label }) => (
                                <button
                                    key={value}
                                    onClick={() => handleThemeChange(value as 'light' | 'dark' | 'system')}
                                    className={cn(
                                        "flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border transition-all",
                                        theme === value
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-muted/40 border-border/50 hover:border-primary/30"
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
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Redis and system connectivity</p>
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
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Runtime and memory details</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-muted/20 rounded-xl p-4">
                        <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Node.js Version</p>
                        <p className="text-lg font-mono font-bold">{systemStatus?.node || '...'}</p>
                    </div>
                    <div className="bg-muted/20 rounded-xl p-4">
                        <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Environment</p>
                        <p className="text-lg font-mono font-bold">{systemStatus?.env || '...'}</p>
                    </div>
                    <div className="bg-muted/20 rounded-xl p-4">
                        <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Memory (RSS)</p>
                        <p className="text-lg font-mono font-bold">{systemStatus?.memory?.rss || '...'}</p>
                    </div>
                    <div className="bg-muted/20 rounded-xl p-4">
                        <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Heap Used</p>
                        <p className="text-lg font-mono font-bold">{systemStatus?.memory?.heapUsed || '...'}</p>
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
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Version and documentation</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between py-3 border-b border-border/30">
                        <span className="font-medium">Version</span>
                        <span className="text-sm font-bold">0.1.0-alpha.1</span>
                    </div>
                    <div className="flex items-center justify-between py-3 border-b border-border/30">
                        <span className="font-medium">Package</span>
                        <code className="text-sm bg-muted px-2 py-1 rounded font-mono">@gravito/flux-console</code>
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

    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m ${Math.floor(seconds % 60)}s`
}
