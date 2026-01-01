import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Calendar, Filter, Terminal, ChevronLeft, ChevronRight, Activity } from 'lucide-react'
import React from 'react'
import { cn } from '../utils'

interface LogArchiveModalProps {
    isOpen: boolean
    onClose: () => void
}

export function LogArchiveModal({ isOpen, onClose }: LogArchiveModalProps) {
    const [page, setPage] = React.useState(1)
    const [search, setSearch] = React.useState('')
    const [level, setLevel] = React.useState<string>('all')
    const [logs, setLogs] = React.useState<any[]>([])
    const [total, setTotal] = React.useState(0)
    const [isLoading, setIsLoading] = React.useState(false)

    const fetchLogs = React.useCallback(async () => {
        setIsLoading(true)
        try {
            const params = new URLSearchParams({
                page: String(page),
                limit: '20',
                search,
                ...(level !== 'all' && { level }),
            })
            const res = await fetch(`/api/logs/archive?${params}`).then(r => r.json())
            setLogs(res.logs || [])
            setTotal(res.total || 0)
        } catch (err) {
            console.error('Failed to fetch archived logs', err)
        } finally {
            setIsLoading(false)
        }
    }, [page, search, level])

    React.useEffect(() => {
        if (isOpen) {
            fetchLogs()
        }
    }, [isOpen, page, level]) // Fetch on mount or filter change. Search is debounced manually or on button.

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        setPage(1)
        fetchLogs()
    }

    const totalPages = Math.ceil(total / 20)

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[4000] flex items-center justify-center p-4 sm:p-8">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="relative w-full max-w-5xl h-full max-h-[800px] bg-card border border-border/50 rounded-3xl shadow-2xl flex flex-col overflow-hidden scanline"
                    >
                        {/* Header */}
                        <div className="p-6 border-b bg-muted/10 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <Terminal size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black tracking-tight">Operation Logs Archive</h2>
                                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">
                                        Query historical system events from persistent storage
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-muted rounded-xl text-muted-foreground transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Filters */}
                        <div className="p-6 bg-muted/5 border-b grid grid-cols-1 md:grid-cols-3 gap-4">
                            <form onSubmit={handleSearch} className="md:col-span-2 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={16} />
                                <input
                                    type="text"
                                    placeholder="Search in log messages..."
                                    className="w-full bg-background border border-border/50 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium outline-none focus:ring-1 focus:ring-primary/30 transition-all"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </form>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/50" size={14} />
                                    <select
                                        className="w-full bg-background border border-border/50 rounded-xl py-2.5 pl-9 pr-4 text-sm font-bold outline-none focus:ring-1 focus:ring-primary/30 transition-all appearance-none"
                                        value={level}
                                        onChange={(e) => {
                                            setLevel(e.target.value)
                                            setPage(1)
                                        }}
                                    >
                                        <option value="all">All Levels</option>
                                        <option value="info">Info</option>
                                        <option value="success">Success</option>
                                        <option value="warn">Warning</option>
                                        <option value="error">Error</option>
                                    </select>
                                </div>
                                <button
                                    onClick={fetchLogs}
                                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
                                >
                                    Filter
                                </button>
                            </div>
                        </div>

                        {/* Logs List */}
                        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
                            {isLoading ? (
                                <div className="h-full flex flex-col items-center justify-center gap-4 py-20">
                                    <RefreshCwIcon className="animate-spin text-primary" size={32} />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">
                                        Querying Archive...
                                    </p>
                                </div>
                            ) : logs.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground/30 gap-4 py-20">
                                    <Activity size={48} className="opacity-10 animate-pulse" />
                                    <p className="font-bold uppercase tracking-widest italic text-sm">
                                        No logs found in this period
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {logs.map((log) => (
                                        <div key={log.id} className="p-4 bg-muted/10 border border-border/20 rounded-2xl flex gap-6 hover:bg-muted/20 transition-all group">
                                            <div className="shrink-0 w-32 border-r border-border/30 pr-4">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Calendar size={12} className="text-muted-foreground/40" />
                                                    <span className="text-[10px] font-black text-muted-foreground/60 tabular-nums uppercase tracking-tighter">
                                                        {new Date(log.timestamp).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <span className="text-xs font-black tabular-nums">
                                                    {new Date(log.timestamp).toLocaleTimeString([], { hour12: false })}
                                                </span>
                                            </div>
                                            <div className="shrink-0 w-20 flex flex-col items-center">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border mb-2",
                                                    log.level === 'error' ? "bg-red-500/10 text-red-500 border-red-500/20" :
                                                        log.level === 'warn' ? "bg-amber-500/10 text-amber-500 border-amber-500/20" :
                                                            log.level === 'success' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                                                "bg-blue-500/10 text-blue-500 border-blue-500/20"
                                                )}>
                                                    {log.level}
                                                </span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <span className="text-[10px] bg-muted px-2 py-0.5 rounded-md font-black text-muted-foreground/70 uppercase">
                                                        Worker: {log.worker_id}
                                                    </span>
                                                    {log.queue && (
                                                        <span className="text-[10px] font-black text-primary/60 uppercase">
                                                            @{log.queue}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm leading-relaxed text-foreground/90 font-mono">
                                                    {log.message}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Footer / Pagination */}
                        <div className="p-6 border-t bg-muted/5 flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                Total {total.toLocaleString()} records • Page {page} of {totalPages || 1}
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    disabled={page === 1 || isLoading}
                                    onClick={() => setPage(p => p - 1)}
                                    className="p-2 border rounded-xl hover:bg-muted disabled:opacity-30 transition-all active:scale-95"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    disabled={page >= totalPages || isLoading}
                                    onClick={() => setPage(p => p + 1)}
                                    className="p-2 border rounded-xl hover:bg-muted disabled:opacity-30 transition-all active:scale-95"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}

function RefreshCwIcon({ className, size }: { className?: string; size?: number }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
            <path d="M21 3v5h-5" />
            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
            <path d="M3 21v-5h5" />
        </svg>
    )
}
