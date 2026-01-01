
import React from 'react'
import { QueryClient, QueryClientProvider, useQuery, useQueryClient } from '@tanstack/react-query'
import { Layout } from './Layout'
import {
    Clock,
    Hourglass,
    Cpu,
    CheckCircle2,
    AlertCircle,
    RefreshCcw,
    ArrowRight,
    Search,
    ChevronRight,
    ListTree,
    Trash2,
    Terminal,
    Activity
} from 'lucide-react'
import { cn } from './utils'
import { ThroughputChart } from './ThroughputChart'
import { WorkerStatus } from './WorkerStatus'
import { motion, AnimatePresence } from 'framer-motion'

const queryClient = new QueryClient()

interface QueueStats {
    name: string
    waiting: number
    delayed: number
    active: number
    failed: number
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
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-end z-[100]" onClick={onClose}>
                <motion.div
                    initial={{ x: '100%' }}
                    animate={{ x: 0 }}
                    exit={{ x: '100%' }}
                    transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                    className="bg-background border-l h-full w-full max-w-2xl shadow-2xl flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="p-6 border-b flex justify-between items-center bg-card">
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <Search className="text-primary" size={20} />
                                Queue Insight
                            </h2>
                            <div className="flex items-center gap-4 mt-2">
                                {(['waiting', 'delayed', 'failed'] as const).map(v => (
                                    <button
                                        key={v}
                                        onClick={() => setView(v)}
                                        className={cn(
                                            "text-xs font-bold px-3 py-1 rounded-full transition-all border shrink-0",
                                            view === v
                                                ? (v === 'failed' ? "bg-red-500 text-white border-red-500" : v === 'delayed' ? "bg-amber-500 text-white border-amber-500" : "bg-primary text-primary-foreground border-primary")
                                                : "bg-muted text-muted-foreground border-transparent hover:bg-muted/80"
                                        )}
                                    >
                                        {v.charAt(0).toUpperCase() + v.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors">✕</button>
                    </div>
                    <div className="p-0 overflow-y-auto flex-1 bg-muted/10">
                        {isPending && <div className="p-12 text-center text-muted-foreground">Loading jobs...</div>}
                        {error && <div className="p-12 text-center text-red-500">Error loading jobs</div>}
                        {data?.jobs && data.jobs.length === 0 && (
                            <div className="p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                                    <CheckCircle2 size={32} />
                                </div>
                                <p className="text-lg font-medium">Clear Sky!</p>
                                <p className="text-sm">No jobs found in this queue.</p>
                            </div>
                        )}
                        {data?.jobs && (
                            <div className="p-6 space-y-4">
                                {data.jobs.map((job, i) => (
                                    <div key={i} className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group">
                                        <div className="p-4 border-b bg-muted/30 flex justify-between items-center text-[10px]">
                                            <span className="font-mono bg-primary/10 text-primary px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                                                ID: {job.id || 'N/A'}
                                            </span>
                                            <span className="text-muted-foreground font-medium flex items-center gap-2">
                                                {view === 'delayed' && job.scheduledAt && (
                                                    <span className="text-amber-600 font-bold flex items-center gap-1">
                                                        <Clock size={12} /> {new Date(job.scheduledAt).toLocaleString()}
                                                    </span>
                                                )}
                                                {view === 'failed' && job.failedAt && (
                                                    <span className="text-red-600 font-bold flex items-center gap-1">
                                                        <AlertCircle size={12} /> {new Date(job.failedAt).toLocaleString()}
                                                    </span>
                                                )}
                                                {job.timestamp && new Date(job.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        <div>
                                            {job.error && (
                                                <div className="p-4 bg-red-50 text-red-700 text-xs font-medium border-b border-red-100 flex items-start gap-2">
                                                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                                                    <p>{job.error}</p>
                                                </div>
                                            )}
                                            <pre className="text-xs font-mono p-4 overflow-x-auto text-foreground leading-relaxed bg-muted/5">
                                                {JSON.stringify(job, null, 2)}
                                            </pre>
                                        </div>
                                        <div className="p-3 bg-muted/10 border-t flex justify-end gap-2">
                                            <button
                                                onClick={() => handleAction('delete', job)}
                                                className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
                                            >
                                                Terminate
                                            </button>
                                            {(view === 'delayed' || view === 'failed') && (
                                                <button
                                                    onClick={() => handleAction('retry', job)}
                                                    className={cn(
                                                        "text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg text-white shadow-sm transition-all",
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
                        <button onClick={onClose} className="px-6 py-2.5 bg-muted text-foreground rounded-xl hover:bg-muted/80 text-sm font-semibold transition-all">
                            Dismiss
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

function LiveLogs() {
    const [logs, setLogs] = React.useState<any[]>([])
    const logEndRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        const ev = new EventSource('/api/logs/stream')
        ev.addEventListener('log', (e) => {
            const data = JSON.parse(e.data)
            setLogs(prev => [...prev.slice(-99), data])
        })
        return () => ev.close()
    }, [])

    React.useEffect(() => {
        logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [logs])

    return (
        <div className="bg-card border rounded-2xl overflow-hidden shadow-sm flex flex-col h-[350px] relative group">
            <div className="p-4 border-b bg-muted/30 flex justify-between items-center backdrop-blur-sm sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        <Terminal size={18} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold leading-none">Operational Logs</h3>
                        <p className="text-[10px] text-muted-foreground mt-1">Live worker events</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setLogs([])} className="p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors" title="Clear Logs">
                        <Trash2 size={14} />
                    </button>
                    <span className="text-[10px] font-mono bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full border border-green-500/20 animate-pulse uppercase">Live</span>
                </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-2 selection:bg-primary/30 custom-scrollbar">
                {logs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                        <Activity size={24} className="animate-pulse text-muted-foreground/30" />
                        <p className="italic">Awaiting system messages...</p>
                    </div>
                )}
                {logs.map((log, i) => (
                    <div key={i} className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300 hover:bg-muted/30 p-1 rounded transition-colors group/item">
                        <span className="text-muted-foreground shrink-0 w-16 opacity-50 text-[10px]">
                            {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                            <div className={cn(
                                "w-1.5 h-1.5 rounded-full",
                                log.level === 'error' ? 'bg-red-500' : log.level === 'warn' ? 'bg-amber-500' : log.level === 'success' ? 'bg-green-500' : 'bg-blue-500'
                            )} />
                            <span className={cn(
                                "font-bold uppercase tracking-tighter w-14",
                                log.level === 'error' ? 'text-red-500' : log.level === 'warn' ? 'text-amber-500' : log.level === 'success' ? 'text-green-500' : 'text-primary'
                            )}>
                                {log.level}
                            </span>
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-2 mb-0.5 text-[9px] font-bold">
                                <span className="bg-muted px-1.5 py-0.5 rounded text-muted-foreground">{log.workerId}</span>
                                {log.queue && <span className="text-primary/70">@{log.queue}</span>}
                            </div>
                            <p className="text-foreground break-all leading-relaxed whitespace-pre-wrap">{log.message}</p>
                        </div>
                    </div>
                ))}
                <div ref={logEndRef} />
            </div>
        </div>
    )
}

function Dashboard() {
    const [selectedQueue, setSelectedQueue] = React.useState<string | null>(null)
    const queryClient = useQueryClient()

    const { isPending, error, data } = useQuery<{ queues: QueueStats[] }>({
        queryKey: ['queues'],
        queryFn: () => fetch('/api/queues').then((res) => res.json()),
        refetchInterval: 2000,
    })

    const { data: workerData } = useQuery<any>({
        queryKey: ['workers'],
        queryFn: async () => {
            const res = await fetch('/api/workers')
            return res.json()
        },
        refetchInterval: 5000
    })

    const { data: historyData } = useQuery<{ history: Record<string, number[]> }>({
        queryKey: ['metrics-history'],
        queryFn: () => fetch('/api/metrics/history').then(res => res.json()),
        refetchInterval: 30000,
    })

    const history = historyData?.history || {}

    if (isPending) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <RefreshCcw className="animate-spin text-primary" size={40} />
            <p className="text-muted-foreground font-medium">Synchronizing with system bus...</p>
        </div>
    )

    if (error) return (
        <div className="text-center p-20">
            <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-100 max-w-md mx-auto">
                <AlertCircle size={48} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Bus Connection Lost</h3>
                <p className="text-sm opacity-90">{error.message}</p>
                <button onClick={() => window.location.reload()} className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all">Recheck</button>
            </div>
        </div>
    )

    const queues = data?.queues || []
    const totalWaiting = queues.reduce((acc, q) => acc + q.waiting, 0)
    const totalDelayed = queues.reduce((acc, q) => acc + q.delayed, 0)
    const totalFailed = queues.reduce((acc, q) => acc + q.failed, 0)
    const activeWorkers = workerData?.workers?.length || 0

    return (
        <div className="space-y-10">
            {selectedQueue && <JobInspector queueName={selectedQueue} onClose={() => setSelectedQueue(null)} />}

            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
                    <p className="text-muted-foreground mt-1 text-sm font-medium">Real-time status of your processing pipelines.</p>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 uppercase tracking-widest animate-pulse">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                    Live Syncing
                </div>
            </div>

            {/* KPI Header Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard title="Waiting Jobs" value={totalWaiting} icon={<Hourglass size={20} />} color="text-amber-500" trend="+12% / hr" data={history.waiting} />
                <MetricCard title="Delayed Jobs" value={totalDelayed} icon={<Clock size={20} />} color="text-blue-500" trend="No change" data={history.delayed} />
                <MetricCard title="Failed Jobs" value={totalFailed} icon={<AlertCircle size={20} />} color="text-red-500" trend={totalFailed > 0 ? 'Review' : 'Stable'} data={history.failed} />
                <MetricCard title="Active Workers" value={activeWorkers} icon={<Cpu size={20} />} color="text-indigo-500" trend={activeWorkers > 0 ? 'Running' : 'Offline'} data={history.workers} />
            </div>

            <ThroughputChart />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1"><WorkerStatus /></div>
                <div className="lg:col-span-2"><LiveLogs /></div>
            </div>

            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Processing Queues</h2>
                    <button className="text-xs font-bold text-primary hover:underline flex items-center gap-1 uppercase tracking-widest">View All <ChevronRight size={14} /></button>
                </div>
                <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] font-bold tracking-[0.1em]">
                            <tr>
                                <th className="px-8 py-5">Pipeline Name</th>
                                <th className="px-8 py-5">Waiting</th>
                                <th className="px-8 py-5">Delayed</th>
                                <th className="px-8 py-5">Failed</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50 text-sm">
                            {queues.map((queue) => (
                                <tr key={queue.name} className="hover:bg-muted/10 transition-colors group">
                                    <td className="px-8 py-6 font-bold text-foreground flex items-center gap-4">
                                        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <ListTree size={20} />
                                        </div>
                                        {queue.name}
                                    </td>
                                    <td className="px-8 py-6 font-mono font-bold">{queue.waiting.toLocaleString()}</td>
                                    <td className="px-8 py-6 text-muted-foreground font-medium">{queue.delayed}</td>
                                    <td className="px-8 py-6"><span className={cn("font-mono font-bold", queue.failed > 0 ? "text-red-500" : "text-muted-foreground")}>{queue.failed}</span></td>
                                    <td className="px-8 py-6">
                                        <span className={cn(
                                            "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border",
                                            queue.failed > 0 ? "bg-red-500/10 text-red-500 border-red-500/20" : queue.active > 0 ? "bg-green-500/10 text-green-500 border-green-500/20" : "bg-muted text-muted-foreground border-transparent"
                                        )}>
                                            {queue.failed > 0 ? 'Critical' : queue.active > 0 ? 'Active' : 'Idle'}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 items-center">
                                            {queue.delayed > 0 && (
                                                <button onClick={() => fetch(`/api/queues/${queue.name}/retry-all`, { method: 'POST' }).then(() => queryClient.invalidateQueries({ queryKey: ['queues'] }))} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors" title="Retry All Delayed"><RefreshCcw size={16} /></button>
                                            )}
                                            {queue.failed > 0 && (
                                                <button onClick={() => fetch(`/api/queues/${queue.name}/retry-all-failed`, { method: 'POST' }).then(() => queryClient.invalidateQueries({ queryKey: ['queues'] }))} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Retry All Failed"><RefreshCcw size={16} /></button>
                                            )}
                                            <button onClick={() => setSelectedQueue(queue.name)} className="px-4 py-2 bg-muted text-foreground rounded-lg transition-all flex items-center gap-2 text-xs font-bold border hover:border-primary/50">Details <ArrowRight size={14} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

interface MetricCardProps {
    title: string
    value: number | string
    icon: React.ReactNode
    color: string
    trend?: string
    data?: number[]
}

function MetricCard({ title, value, icon, color, trend, data }: MetricCardProps) {
    const displayData = data && data.length > 0 ? data : [20, 30, 25, 40, 35, 50, 45, 60, 55, 70]
    const max = Math.max(...displayData, 10)

    return (
        <div className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4 z-10 relative">
                <div className={cn("p-2.5 rounded-xl bg-muted/50 transition-colors group-hover:bg-primary/10 group-hover:text-primary", color)}>{icon}</div>
                {trend && <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-80">{trend}</span>}
            </div>
            <div className="z-10 relative">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
                <div className="text-3xl font-black">{value}</div>
            </div>
            <div className="mt-6 flex items-end gap-1 h-12 opacity-10 group-hover:opacity-30 transition-opacity absolute bottom-0 left-0 right-0 p-1 pointer-events-none">
                {displayData.map((v, i) => (
                    <div
                        key={i}
                        className={cn("flex-1 rounded-t-sm transition-all duration-700", color.replace('text-', 'bg-'))}
                        style={{ height: `${(v / max) * 100}%`, opacity: 0.3 + (i / displayData.length) * 0.7 }}
                    ></div>
                ))}
            </div>
        </div>
    )
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Layout><Dashboard /></Layout>
        </QueryClientProvider>
    )
}

export default App
