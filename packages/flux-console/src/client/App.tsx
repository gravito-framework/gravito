
import React from 'react'
import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query'
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
    Activity,
    ListTree
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
    raw?: string
    error?: string
}

function JobInspector({ queueName, onClose }: { queueName: string, onClose: () => void }) {

    const { isPending, error, data } = useQuery<{ jobs: Job[] }>({
        queryKey: ['jobs', queueName],
        queryFn: () => fetch(`/api/queues/${queueName}/jobs`).then(res => res.json()),
    })

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
                            <p className="text-sm text-muted-foreground mt-1">Viewing jobs in <span className="font-mono font-medium text-foreground">{queueName}</span></p>
                        </div>
                        <button onClick={onClose} className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors">
                            ✕
                        </button>
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
                                        <div className="p-4 border-b bg-muted/30 flex justify-between items-center">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-[10px] bg-primary/10 text-primary px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                                                    ID: {job.id || 'N/A'}
                                                </span>
                                                {job.status && (
                                                    <span className="text-[10px] bg-green-100 text-green-700 px-2 py-1 rounded-md font-bold uppercase tracking-wider">
                                                        {job.status}
                                                    </span>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-medium">
                                                {job.timestamp ? new Date(job.timestamp).toLocaleString() : ''}
                                            </span>
                                        </div>
                                        <div className="p-0">
                                            <pre className="text-xs font-mono p-4 overflow-x-auto text-foreground leading-relaxed">
                                                {JSON.stringify(job, null, 2)}
                                            </pre>
                                        </div>
                                        <div className="p-3 bg-muted/10 border-t flex justify-end gap-2">
                                            <button className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-red-50 text-red-600 transition-colors">Terminate</button>
                                            <button className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 transition-all">Retry Now</button>
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

function Dashboard() {
    const [selectedQueue, setSelectedQueue] = React.useState<string | null>(null)

    const { isPending, error, data } = useQuery<{ queues: QueueStats[] }>({
        queryKey: ['queues'],
        queryFn: () =>
            fetch('/api/queues').then((res) => res.json()),
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

    if (isPending) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <RefreshCcw className="animate-spin text-primary" size={40} />
            <p className="text-muted-foreground font-medium">Synchronizing with system bus...</p>
        </div>
    )

    if (error) return (
        <div className="text-center p-20">
            <div className="bg-red-50 text-red-600 p-8 rounded-2xl border border-red-100 max-w-md mx-auto inline-block">
                <AlertCircle size={48} className="mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Bus Connection Lost</h3>
                <p className="text-sm opacity-90">{error.message}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="mt-6 px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-all"
                >
                    Attempt Reconnection
                </button>
            </div>
        </div>
    )

    const queues = data?.queues || []
    const totalWaiting = queues.reduce((acc: number, q: QueueStats) => acc + q.waiting, 0)
    const totalDelayed = queues.reduce((acc: number, q: QueueStats) => acc + q.delayed, 0)

    const activeWorkers = workerData?.workers?.length || 0

    return (
        <div className="space-y-10">
            {selectedQueue && (
                <JobInspector
                    queueName={selectedQueue}
                    onClose={() => setSelectedQueue(null)}
                />
            )}

            {/* Header / Page Title */}
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
                    <p className="text-muted-foreground mt-1">Real-time status of your processing pipelines.</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-green-500 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20 uppercase tracking-widest animate-pulse">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    Live Syncing
                </div>
            </div>

            {/* Metrics & Chart Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                    <ThroughputChart />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                    <MetricCard
                        title="Waiting Jobs"
                        value={totalWaiting}
                        icon={<Hourglass size={20} />}
                        color="text-amber-500"
                        trend="+12% / hr"
                    />
                    <MetricCard
                        title="Delayed Jobs"
                        value={totalDelayed}
                        icon={<Clock size={20} />}
                        color="text-blue-500"
                        trend="No change"
                    />
                    <MetricCard
                        title="Active Workers"
                        value={activeWorkers}
                        icon={<Cpu size={20} />}
                        color="text-indigo-500"
                        trend={activeWorkers > 0 ? 'Healthy' : 'Zero Active'}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <WorkerStatus />
                </div>
                <div className="lg:col-span-2">
                    <div className="bg-card border rounded-2xl p-6 shadow-sm h-full flex flex-col justify-center items-center text-center space-y-4 min-h-[200px]">
                        <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center">
                            <Activity size={32} />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Operational Logs</h3>
                            <p className="text-sm text-muted-foreground max-w-xs">Detailed audit trails and system event logs will appear here.</p>
                        </div>
                        <button className="px-4 py-2 bg-muted text-xs font-bold rounded-lg hover:bg-muted/80 transition-all uppercase tracking-widest">Open Log Viewer</button>
                    </div>
                </div>
            </div>

            {/* Queue List */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold">Processing Queues</h2>
                    <button className="text-sm font-semibold text-primary hover:underline flex items-center gap-1">
                        View All <ChevronRight size={16} />
                    </button>
                </div>
                <div className="bg-card border rounded-2xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-muted/30 text-muted-foreground uppercase text-[10px] font-bold tracking-[0.1em]">
                            <tr>
                                <th className="px-8 py-5">Pipeline Name</th>
                                <th className="px-8 py-5">Waiting</th>
                                <th className="px-8 py-5">Delayed</th>
                                <th className="px-8 py-5">Status</th>
                                <th className="px-8 py-5 text-right">Operations</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/50">
                            {queues.map((queue: QueueStats) => (
                                <tr key={queue.name} className="hover:bg-muted/10 transition-colors group">
                                    <td className="px-8 py-6 font-semibold text-foreground flex items-center gap-4">
                                        <div className="w-10 h-10 bg-primary/5 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <ListTree size={20} />
                                        </div>
                                        {queue.name}
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <span className={cn(
                                                "font-mono font-bold text-lg",
                                                queue.waiting > 0 ? "text-amber-500" : "text-muted-foreground"
                                            )}>
                                                {queue.waiting.toLocaleString()}
                                            </span>
                                            {queue.waiting > 0 && <span className="w-1.5 h-1.5 bg-amber-500 rounded-full"></span>}
                                        </div>
                                    </td>
                                    <td className="px-8 py-6 text-muted-foreground font-medium">{queue.delayed}</td>
                                    <td className="px-8 py-6">
                                        {queue.waiting > 1000 ?
                                            <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-red-100 w-fit">
                                                <AlertCircle size={14} /> Backlog
                                            </div> :
                                            <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 w-fit">
                                                <CheckCircle2 size={14} /> Healthy
                                            </div>
                                        }
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {queue.delayed > 0 && (
                                                <button
                                                    onClick={() => {
                                                        fetch(`/api/queues/${queue.name}/retry-all`, { method: 'POST' })
                                                            .then(() => queryClient.invalidateQueries({ queryKey: ['queues'] }))
                                                    }}
                                                    className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors flex items-center gap-2 text-xs font-bold"
                                                    title="Flush Delayed"
                                                >
                                                    <RefreshCcw size={16} />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setSelectedQueue(queue.name)}
                                                className="px-4 py-2 bg-muted text-foreground rounded-lg transition-all flex items-center gap-2 text-xs font-bold border hover:border-primary/50"
                                            >
                                                Inspect <ArrowRight size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {queues.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-muted-foreground">
                                        <p className="text-lg font-medium opacity-50 italic">Waiting for bus activity...</p>
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

interface MetricCardProps {
    title: string
    value: number | string
    icon: React.ReactNode
    color: string
    hint?: string
    trend?: string
}

function MetricCard({ title, value, icon, color, hint, trend }: MetricCardProps) {
    return (
        <div className="bg-card border rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all transform hover:-translate-y-1 group">
            <div className="flex justify-between items-start mb-4">
                <div className={cn("p-2.5 rounded-xl bg-muted/50 transition-colors group-hover:bg-primary/10 group-hover:text-primary", color)}>
                    {icon}
                </div>
                {trend && (
                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-80">{trend}</span>
                )}
            </div>
            <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <div className="text-3xl font-black">{value}</div>
                    {hint && <span className="text-[10px] font-medium text-muted-foreground italic">( {hint} )</span>}
                </div>
            </div>
            {/* Pseudo Sparkline */}
            <div className="mt-6 flex items-end gap-1 h-8 opacity-20 group-hover:opacity-100 transition-opacity">
                {[40, 70, 45, 90, 65, 80, 50, 85, 95, 60].map((h, i) => (
                    <div key={i} className="flex-1 bg-primary/20 rounded-t-sm group-hover:bg-primary/40 transition-all" style={{ height: `${h}%` }}></div>
                ))}
            </div>
        </div>
    )
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <Layout>
                <Dashboard />
            </Layout>
        </QueryClientProvider>
    )
}

export default App
