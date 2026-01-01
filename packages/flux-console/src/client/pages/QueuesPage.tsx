import React from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
    ListTree,
    Search,
    RefreshCcw,
    Trash2,
    ArrowRight,
    Filter,
    AlertCircle,
    Clock,
    Activity,
    CheckCircle2,
    Pause,
    Play
} from 'lucide-react'
import { cn } from '../utils'
import { motion, AnimatePresence } from 'framer-motion'

interface QueueStats {
    name: string
    waiting: number
    delayed: number
    active: number
    failed: number
    paused?: boolean
}

interface Job {
    id: string
    name?: string
    data?: any
    status?: string
    timestamp?: number
    scheduledAt?: string
    error?: string
    failedAt?: number
    _raw?: string
}

function JobInspector({ queueName, onClose }: { queueName: string, onClose: () => void }) {
    const [view, setView] = React.useState<'waiting' | 'delayed' | 'failed'>('waiting')
    const queryClient = useQueryClient()

    const { isPending, error, data } = useQuery<{ jobs: Job[] }>({
        queryKey: ['jobs', queueName, view],
        queryFn: () => fetch(`/api/queues/${queueName}/jobs?type=${view}`).then(res => res.json()),
    })

    const handleAction = async (action: 'delete' | 'retry', job: Job) => {
        const endpoint = action === 'delete' ? 'delete' : 'retry'
        const body: any = { raw: job._raw }
        if (action === 'delete') body.type = view

        await fetch(`/api/queues/${queueName}/jobs/${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })

        queryClient.invalidateQueries({ queryKey: ['jobs', queueName] })
        queryClient.invalidateQueries({ queryKey: ['queues'] })
    }

    return (
        <AnimatePresence>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-end z-[100]" onClick={onClose}>
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="bg-card border-l h-full w-full max-w-2xl shadow-2xl flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 border-b flex justify-between items-center bg-muted/20">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Search className="text-primary" size={20} />
                                Queue Insight: <span className="text-primary">{queueName}</span>
                            </h2>
                            <div className="flex items-center gap-4 mt-2">
                                {(['waiting', 'delayed', 'failed'] as const).map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setView(v)}
                                        className={cn(
                                            "text-xs font-bold px-3 py-1 rounded-full transition-all border shrink-0 uppercase tracking-widest",
                                            view === v
                                                ? (v === 'failed' ? "bg-red-500 text-white border-red-500" : v === 'delayed' ? "bg-amber-500 text-white border-amber-500" : "bg-primary text-primary-foreground border-primary")
                                                : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                                        )}
                                    >
                                        {v}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors">✕</button>
                    </div>
                    <div className="p-0 overflow-y-auto flex-1 bg-muted/5">
                        {isPending && <div className="p-12 text-center text-muted-foreground font-medium animate-pulse">Loading jobs...</div>}
                        {error && <div className="p-12 text-center text-red-500 font-bold">Error loading jobs</div>}
                        {data?.jobs && data.jobs.length === 0 && (
                            <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-muted/50 rounded-full flex items-center justify-center text-muted-foreground/30">
                                    <CheckCircle2 size={32} />
                                </div>
                                <p className="text-lg font-bold">Clear Sky!</p>
                                <p className="text-sm opacity-60">No jobs found in this queue.</p>
                            </div>
                        )}
                        {data?.jobs && (
                            <div className="p-6 space-y-4">
                                {data.jobs.map((job, i) => (
                                    <div key={i} className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group border-border/50">
                                        <div className="p-4 border-b bg-muted/10 flex justify-between items-center text-[10px]">
                                            <span className="font-mono bg-primary/10 text-primary px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                                                ID: {job.id || 'N/A'}
                                            </span>
                                            <span className="text-muted-foreground font-semibold flex items-center gap-3">
                                                {view === 'delayed' && job.scheduledAt && (
                                                    <span className="text-amber-500 flex items-center gap-1 font-bold">
                                                        <Clock size={12} /> {new Date(job.scheduledAt).toLocaleString()}
                                                    </span>
                                                )}
                                                {view === 'failed' && job.failedAt && (
                                                    <span className="text-red-500 flex items-center gap-1 font-bold">
                                                        <AlertCircle size={12} /> {new Date(job.failedAt).toLocaleString()}
                                                    </span>
                                                )}
                                                {job.timestamp && new Date(job.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        <div>
                                            {job.error && (
                                                <div className="p-4 bg-red-500/10 text-red-500 text-xs font-semibold border-b border-red-500/10 flex items-start gap-2">
                                                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                                    <p>{job.error}</p>
                                                </div>
                                            )}
                                            <pre className="text-[11px] font-mono p-4 overflow-x-auto text-foreground/80 leading-relaxed bg-muted/5">
                                                {JSON.stringify(job, null, 2)}
                                            </pre>
                                        </div>
                                        <div className="p-3 bg-muted/5 border-t border-border/50 flex justify-end gap-2">
                                            <button
                                                onClick={() => handleAction('delete', job)}
                                                className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                                            >
                                                Terminate
                                            </button>
                                            {(view === 'delayed' || view === 'failed') && (
                                                <button
                                                    onClick={() => handleAction('retry', job)}
                                                    className={cn(
                                                        "text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg text-white shadow-sm transition-all",
                                                        view === 'delayed' ? "bg-amber-500 hover:bg-amber-600" : "bg-blue-500 hover:bg-blue-600"
                                                    )}
                                                >
                                                    {view === 'delayed' ? 'Process Now' : 'Retry Job'}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className="p-4 border-t bg-card text-right">
                        <button onClick={onClose} className="px-8 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 text-sm font-bold transition-all active:scale-95 uppercase tracking-widest">
                            Dismiss
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

export function QueuesPage() {
    const [selectedQueue, setSelectedQueue] = React.useState<string | null>(null)
    const [searchQuery, setSearchQuery] = React.useState('')
    const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'idle' | 'critical'>('all')
    const queryClient = useQueryClient()

    const { isPending, error, data } = useQuery<{ queues: QueueStats[] }>({
        queryKey: ['queues'],
        queryFn: () => fetch('/api/queues').then((res) => res.json()),
        staleTime: Infinity, // No auto refetch
    })

    // Listen for real-time updates from Layout's global stream
    React.useEffect(() => {
        const handler = (e: CustomEvent) => {
            if (e.detail?.queues) {
                queryClient.setQueryData(['queues'], { queues: e.detail.queues })
            }
        }
        window.addEventListener('flux-stats-update', handler as EventListener)
        return () => window.removeEventListener('flux-stats-update', handler as EventListener)
    }, [queryClient])

    const queues = data?.queues || []

    const filteredQueues = queues.filter(q => {
        const matchesSearch = q.name.toLowerCase().includes(searchQuery.toLowerCase())
        const status = q.failed > 0 ? 'critical' : q.active > 0 ? 'active' : 'idle'
        const matchesStatus = statusFilter === 'all' || status === statusFilter
        return matchesSearch && matchesStatus
    })

    const totalWaiting = queues.reduce((acc, q) => acc + q.waiting, 0)
    const totalDelayed = queues.reduce((acc, q) => acc + q.delayed, 0)
    const totalFailed = queues.reduce((acc, q) => acc + q.failed, 0)
    const totalActive = queues.reduce((acc, q) => acc + q.active, 0)

    if (isPending) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-6">
            <RefreshCcw className="animate-spin text-primary" size={48} />
            <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-xs">Loading queues...</p>
        </div>
    )

    if (error) return (
        <div className="text-center p-20">
            <div className="bg-red-500/10 text-red-500 p-10 rounded-3xl border border-red-500/20 max-w-md mx-auto shadow-2xl">
                <AlertCircle size={56} className="mx-auto mb-6 opacity-80" />
                <h3 className="text-2xl font-black mb-2 uppercase tracking-tight">Failed to Load Queues</h3>
                <p className="text-sm font-medium opacity-70 mb-8">{error.message}</p>
            </div>
        </div>
    )

    return (
        <div className="space-y-8">
            {selectedQueue && <JobInspector queueName={selectedQueue} onClose={() => setSelectedQueue(null)} />}

            {/* Header */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Processing Queues</h1>
                    <p className="text-muted-foreground mt-2 text-sm font-bold opacity-60 uppercase tracking-widest">Manage and monitor all processing pipelines.</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-green-500 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20 uppercase tracking-[0.2em] animate-pulse">
                    <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                    {queues.length} Queues
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="card-premium p-6">
                    <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Total Waiting</p>
                    <p className="text-3xl font-black">{totalWaiting.toLocaleString()}</p>
                </div>
                <div className="card-premium p-6">
                    <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Total Delayed</p>
                    <p className="text-3xl font-black text-amber-500">{totalDelayed.toLocaleString()}</p>
                </div>
                <div className="card-premium p-6">
                    <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Total Failed</p>
                    <p className="text-3xl font-black text-red-500">{totalFailed.toLocaleString()}</p>
                </div>
                <div className="card-premium p-6">
                    <p className="text-[10px] font-black text-muted-foreground/50 uppercase tracking-widest mb-1">Currently Active</p>
                    <p className="text-3xl font-black text-green-500">{totalActive.toLocaleString()}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card-premium p-4 flex flex-wrap gap-4 items-center">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                    <input
                        type="text"
                        placeholder="Search queues..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-muted/40 border border-border/50 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-muted-foreground" />
                    {(['all', 'active', 'idle', 'critical'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setStatusFilter(status)}
                            className={cn(
                                "px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all",
                                statusFilter === status
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                            )}
                        >
                            {status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Queue List */}
            <div className="card-premium overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-muted/10 text-muted-foreground uppercase text-[10px] font-black tracking-[0.2em]">
                            <tr>
                                <th className="px-6 py-5">Queue Name</th>
                                <th className="px-6 py-5 text-center">Waiting</th>
                                <th className="px-6 py-5 text-center">Delayed</th>
                                <th className="px-6 py-5 text-center">Active</th>
                                <th className="px-6 py-5 text-center">Failed</th>
                                <th className="px-6 py-5 text-center">Status</th>
                                <th className="px-6 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/30 text-sm">
                            {filteredQueues.map((queue) => {
                                const status = queue.failed > 0 ? 'critical' : queue.active > 0 ? 'active' : 'idle'
                                return (
                                    <tr key={queue.name} className="hover:bg-muted/5 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <ListTree size={20} />
                                                </div>
                                                <span className="font-black tracking-tight">{queue.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center font-mono font-bold">{queue.waiting.toLocaleString()}</td>
                                        <td className="px-6 py-5 text-center font-mono text-amber-500">{queue.delayed}</td>
                                        <td className="px-6 py-5 text-center font-mono text-green-500">{queue.active}</td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={cn("font-mono font-black", queue.failed > 0 ? "text-red-500" : "text-muted-foreground/40")}>
                                                {queue.failed}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5 text-center">
                                            <span className={cn(
                                                "px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                queue.paused ? "bg-amber-500/20 text-amber-500 border-amber-500/30" :
                                                    status === 'critical' ? "bg-red-500 text-white border-red-600" :
                                                        status === 'active' ? "bg-green-500/10 text-green-500 border-green-500/20" :
                                                            "bg-muted/40 text-muted-foreground border-transparent"
                                            )}>
                                                {queue.paused ? 'paused' : status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex justify-end gap-2 items-center">
                                                {/* Pause/Resume button */}
                                                <button
                                                    onClick={async () => {
                                                        const action = queue.paused ? 'resume' : 'pause'
                                                        await fetch(`/api/queues/${queue.name}/${action}`, { method: 'POST' })
                                                        queryClient.invalidateQueries({ queryKey: ['queues'] })
                                                    }}
                                                    className={cn(
                                                        "p-2 rounded-lg transition-all",
                                                        queue.paused
                                                            ? "text-green-500 hover:bg-green-500/10"
                                                            : "text-muted-foreground hover:bg-amber-500/10 hover:text-amber-500"
                                                    )}
                                                    title={queue.paused ? 'Resume Queue' : 'Pause Queue'}
                                                >
                                                    {queue.paused ? <Play size={16} /> : <Pause size={16} />}
                                                </button>
                                                {queue.delayed > 0 && (
                                                    <button
                                                        onClick={() => fetch(`/api/queues/${queue.name}/retry-all`, { method: 'POST' }).then(() => queryClient.invalidateQueries({ queryKey: ['queues'] }))}
                                                        className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-lg transition-all"
                                                        title="Retry All Delayed"
                                                    >
                                                        <RefreshCcw size={16} />
                                                    </button>
                                                )}
                                                {queue.failed > 0 && (
                                                    <button
                                                        onClick={() => fetch(`/api/queues/${queue.name}/retry-all-failed`, { method: 'POST' }).then(() => queryClient.invalidateQueries({ queryKey: ['queues'] }))}
                                                        className="p-2 text-blue-500 hover:bg-blue-500/10 rounded-lg transition-all"
                                                        title="Retry All Failed"
                                                    >
                                                        <RefreshCcw size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={async () => {
                                                        if (confirm(`Are you sure you want to purge all jobs in queue "${queue.name}"?`)) {
                                                            await fetch(`/api/queues/${queue.name}/purge`, { method: 'POST' })
                                                            queryClient.invalidateQueries({ queryKey: ['queues'] })
                                                        }
                                                    }}
                                                    className="p-2 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all"
                                                    title="Purge Queue"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => setSelectedQueue(queue.name)}
                                                    className="px-4 py-1.5 bg-muted text-foreground rounded-lg transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-border/50 hover:border-primary/50 hover:bg-background"
                                                >
                                                    Inspect <ArrowRight size={12} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {filteredQueues.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center text-muted-foreground">
                                        <Activity size={40} className="mx-auto mb-4 opacity-10 animate-pulse" />
                                        <p className="text-sm font-bold opacity-30 italic uppercase tracking-widest">
                                            {searchQuery || statusFilter !== 'all' ? 'No queues match your filters' : 'No queues available'}
                                        </p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
