import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, animate, motion } from 'framer-motion'
import {
  Activity,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  Clock,
  Cpu,
  Hourglass,
  ListTree,
  RefreshCcw,
  Search,
  Terminal,
  Trash2,
} from 'lucide-react'
import React from 'react'
import { ThroughputChart } from '../ThroughputChart'
import { cn } from '../utils'
import { WorkerStatus } from '../WorkerStatus'

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
  _archived?: boolean
  _type?: string
  _queue?: string
}

function JobInspector({ queueName, onClose }: { queueName: string; onClose: () => void }) {
  const [view, setView] = React.useState<'waiting' | 'delayed' | 'failed'>('waiting')
  const queryClient = useQueryClient()

  const { isPending, error, data } = useQuery<{ jobs: Job[] }>({
    queryKey: ['jobs', queueName, view],
    queryFn: () => fetch(`/api/queues/${queueName}/jobs?type=${view}`).then((res) => res.json()),
  })

  const handleAction = async (action: 'delete' | 'retry', job: Job) => {
    const endpoint = action === 'delete' ? 'delete' : 'retry'
    const body: Record<string, string | undefined> = { raw: job._raw }
    if (action === 'delete') {
      body.type = view
    }

    await fetch(`/api/queues/${queueName}/jobs/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    queryClient.invalidateQueries({ queryKey: ['jobs', queueName] })
    queryClient.invalidateQueries({ queryKey: ['queues'] })
  }

  return (
    <AnimatePresence>
      <button
        type="button"
        className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-end z-[100] w-full h-full border-none outline-none appearance-none cursor-default"
        onClick={onClose}
      >
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
                Queue Insight
              </h2>
              <div className="flex items-center gap-4 mt-2">
                {(['waiting', 'delayed', 'failed'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setView(v)}
                    className={cn(
                      'text-xs font-bold px-3 py-1 rounded-full transition-all border shrink-0 uppercase tracking-widest',
                      view === v
                        ? v === 'failed'
                          ? 'bg-red-500 text-white border-red-500'
                          : v === 'delayed'
                            ? 'bg-amber-500 text-white border-amber-500'
                            : 'bg-primary text-primary-foreground border-primary'
                        : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
                    )}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-muted flex items-center justify-center transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="p-0 overflow-y-auto flex-1 bg-muted/5">
            {isPending && (
              <div className="p-12 text-center text-muted-foreground font-medium animate-pulse">
                Loading jobs...
              </div>
            )}
            {error && (
              <div className="p-12 text-center text-red-500 font-bold">Error loading jobs</div>
            )}
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
                  <div
                    key={i}
                    className="bg-card border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all group border-border/50"
                  >
                    <div className="p-4 border-b bg-muted/10 flex justify-between items-center text-[10px]">
                      <span className="font-mono bg-primary/10 text-primary px-2 py-1 rounded-md font-bold uppercase tracking-wider flex items-center gap-2">
                        ID: {job.id || 'N/A'}
                        {job._archived && (
                          <span className="bg-amber-500/20 text-amber-500 px-1.5 py-0.5 rounded text-[8px] border border-amber-500/20">
                            Archived
                          </span>
                        )}
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
                            'text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-lg text-white shadow-sm transition-all',
                            view === 'delayed'
                              ? 'bg-amber-500 hover:bg-amber-600'
                              : 'bg-blue-500 hover:bg-blue-600'
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
            <button
              onClick={onClose}
              className="px-8 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 text-sm font-bold transition-all active:scale-95 uppercase tracking-widest"
            >
              Dismiss
            </button>
          </div>
        </motion.div>
      </button>
    </AnimatePresence>
  )
}

function LiveLogs({ onWorkerHover }: { onWorkerHover?: (id: string | null) => void }) {
  const [logs, setLogs] = React.useState<Record<string, any>[]>([])
  const logEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const handler = (e: CustomEvent) => {
      const data = e.detail
      setLogs((prev) => [...prev.slice(-99), data])
    }
    window.addEventListener('flux-log-update', handler as EventListener)
    return () => window.removeEventListener('flux-log-update', handler as EventListener)
  }, [])

  React.useEffect(() => {
    const handler = () => setLogs([])
    window.addEventListener('clear-logs', handler)
    return () => window.removeEventListener('clear-logs', handler)
  }, [])

  React.useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  return (
    <div className="card-premium h-[350px] flex flex-col relative group">
      <div className="p-4 border-b bg-muted/10 flex justify-between items-center backdrop-blur-sm sticky top-0 z-10 border-border/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <Terminal size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold leading-none">Operational Logs</h3>
            <p className="text-[10px] text-muted-foreground mt-1 uppercase tracking-wider font-bold opacity-60">
              Live worker events
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setLogs([])}
            className="p-1.5 hover:bg-muted rounded-md text-muted-foreground transition-colors"
            title="Clear Logs"
          >
            <Trash2 size={14} />
          </button>
          <span className="text-[9px] font-black bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full border border-green-500/20 animate-pulse uppercase tracking-tighter">
            Live
          </span>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 font-mono text-[11px] space-y-2 selection:bg-primary/30 scrollbar-thin">
        {logs.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-muted-foreground/40 gap-3">
            <Activity size={24} className="animate-pulse opacity-20" />
            <p className="italic text-[10px] font-bold uppercase tracking-widest">
              Awaiting system messages...
            </p>
          </div>
        )}
        {logs.map((log, i) => (
          <div
            key={i}
            className="flex gap-4 animate-in fade-in slide-in-from-left-2 duration-300 hover:bg-muted/30 p-1.5 rounded-lg transition-colors group/item cursor-default"
            onMouseEnter={() => onWorkerHover?.(log.workerId)}
            onMouseLeave={() => onWorkerHover?.(null)}
          >
            <span className="text-muted-foreground/50 shrink-0 w-16 text-[10px] font-bold">
              {new Date(log.timestamp).toLocaleTimeString([], {
                hour12: false,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </span>
            <div className="flex items-center gap-2 shrink-0">
              <div
                className={cn(
                  'w-1.5 h-1.5 rounded-full',
                  log.level === 'error'
                    ? 'bg-red-500'
                    : log.level === 'warn'
                      ? 'bg-amber-500'
                      : log.level === 'success'
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                )}
              />
              <span
                className={cn(
                  'font-bold uppercase tracking-tighter w-14',
                  log.level === 'error'
                    ? 'text-red-500'
                    : log.level === 'warn'
                      ? 'text-amber-500'
                      : log.level === 'success'
                        ? 'text-green-500'
                        : 'text-primary'
                )}
              >
                {log.level}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-0.5 text-[9px] font-black uppercase tracking-tighter">
                <span className="bg-muted px-1.5 py-0.5 rounded text-muted-foreground/70">
                  {log.workerId}
                </span>
                {log.queue && <span className="text-primary/70">@{log.queue}</span>}
              </div>
              <p className="text-foreground/90 break-all leading-relaxed whitespace-pre-wrap">
                {log.message}
              </p>
            </div>
          </div>
        ))}
        <div ref={logEndRef} />
      </div>
    </div>
  )
}

function QueueHeatmap({ queues }: { queues: any[] }) {
  return (
    <div className="card-premium p-6 mb-8 overflow-hidden relative group">
      <div className="absolute inset-0 opacity-10 group-hover:opacity-20 transition-opacity scanline pointer-events-none"></div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity size={14} className="text-primary animate-pulse" />
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60">
            Pipeline Load Distribution
          </h3>
        </div>
        <div className="flex gap-1">
          {[0.2, 0.4, 0.6, 0.8, 1].map((o) => (
            <div key={o} className="w-2 h-2 rounded-sm bg-primary" style={{ opacity: o }} />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5">
        {queues.map((q, i) => {
          const load = Math.min(1, q.waiting / 200)
          return (
            <div
              key={i}
              className="aspect-square rounded-sm transition-all duration-500 hover:scale-125 cursor-help group/tile relative"
              style={{
                backgroundColor: `hsl(var(--primary) / ${0.1 + load * 0.9})`,
                boxShadow: load > 0.7 ? `0 0 10px hsl(var(--primary) / ${load})` : 'none',
              }}
            >
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-popover text-popover-foreground rounded-lg text-[10px] whitespace-nowrap opacity-0 group-hover/tile:opacity-100 transition-opacity pointer-events-none border border-border z-50">
                <span className="font-black">{q.name}</span>: {q.waiting} items
              </div>
            </div>
          )
        })}
        {Array.from({ length: Math.max(0, 40 - queues.length) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className="aspect-square rounded-sm bg-muted/20 border border-border/5 group-hover:border-border/10 transition-colors"
          />
        ))}
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: number
  icon: React.ReactNode
  color: string
  trend?: string
  data?: number[]
}

function AnimatedNumber({ value }: { value: number }) {
  const [displayValue, setDisplayValue] = React.useState(value)

  React.useEffect(() => {
    const controls = animate(displayValue, value, {
      duration: 1.5,
      ease: 'easeOut',
      onUpdate: (latest: number) => setDisplayValue(Math.round(latest)),
    })
    return () => controls.stop()
  }, [value, displayValue])

  return <span>{displayValue.toLocaleString()}</span>
}

function MetricCard({ title, value, icon, color, trend, data }: MetricCardProps) {
  const displayData = data && data.length > 0 ? data : [20, 30, 25, 40, 35, 50, 45, 60, 55, 70]
  const max = Math.max(...displayData, 10)

  return (
    <div className="card-premium p-8 hover:shadow-2xl transform hover:-translate-y-2 group relative overflow-hidden">
      {/* Subtle Scanline for Card */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none scanline z-0"></div>

      <div className="flex justify-between items-start mb-6 z-10 relative">
        <div
          className={cn(
            'p-4 rounded-2xl bg-muted/30 transition-all group-hover:bg-primary/20 group-hover:text-primary group-hover:rotate-12 duration-500 border border-transparent group-hover:border-primary/20 shadow-inner',
            color
          )}
        >
          {icon}
        </div>
        {trend && (
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
              {trend}
            </span>
            <div className="w-8 h-1 bg-muted/50 rounded-full mt-1 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                className={cn('h-full', color.replace('text-', 'bg-'))}
              />
            </div>
          </div>
        )}
      </div>

      <div className="z-10 relative">
        <p className="text-[11px] font-black text-muted-foreground/50 uppercase tracking-[0.2em] mb-2">
          {title}
        </p>
        <div className="text-4xl font-black tracking-tighter flex items-center gap-1">
          <AnimatedNumber value={value} />
          {title === 'Waiting Jobs' && value > 100 && (
            <span className="text-red-500 animate-pulse text-xs">!</span>
          )}
        </div>
      </div>

      {/* Real or Pseudo Sparkline */}
      <div className="mt-8 flex items-end gap-1.5 h-16 opacity-5 group-hover:opacity-20 transition-all duration-700 absolute bottom-0 left-0 right-0 p-1.5 pointer-events-none">
        {displayData.map((v, i) => (
          <div
            key={i}
            className={cn(
              'flex-1 rounded-t-lg transition-all duration-1000',
              color.replace('text-', 'bg-')
            )}
            style={{
              height: `${(v / max) * 100}%`,
              opacity: 0.1 + (i / displayData.length) * 0.9,
              transitionDelay: `${i * 30}ms`,
            }}
          ></div>
        ))}
      </div>
    </div>
  )
}

export function OverviewPage() {
  const [selectedQueue, setSelectedQueue] = React.useState<string | null>(null)
  const [hoveredWorkerId, setHoveredWorkerId] = React.useState<string | null>(null)
  const queryClient = useQueryClient()

  React.useEffect(() => {
    const handler = (e: any) => setSelectedQueue(e.detail)
    window.addEventListener('select-queue', handler)
    return () => window.removeEventListener('select-queue', handler)
  }, [])

  // State management for real-time data
  const [queues, setQueues] = React.useState<QueueStats[]>([])
  const [workers, setWorkers] = React.useState<any[]>([])
  // const [history, setHistory] = React.useState<Record<string, number[]>>({}) // Keep using useQuery for heavy history for now? No, let's sync.

  // Initial fetch manually to avoid any React Query background behavior
  React.useEffect(() => {
    fetch('/api/queues')
      .then((res) => res.json())
      .then((data) => {
        if (data.queues) {
          setQueues(data.queues)
        }
      })
    fetch('/api/workers')
      .then((res) => res.json())
      .then((data) => {
        if (data.workers) {
          setWorkers(data.workers)
        }
      })
  }, [])

  // Unified Event Listener for all metrics
  React.useEffect(() => {
    // We use a custom event dispatched by the LiveLogs component (or a global manager if we had one)
    // For now, let's just listen to the global window event we dispatch from the main stream
    const handler = (e: any) => {
      const stats = e.detail
      if (stats) {
        if (stats.queues) {
          setQueues(stats.queues)
        }
        if (stats.workers) {
          setWorkers(stats.workers)
        }
        // History updates could be merged here if we sent delta updates
      }
    }
    window.addEventListener('flux-stats-update', handler)
    return () => window.removeEventListener('flux-stats-update', handler)
  }, [])

  const { data: historyData } = useQuery<{ history: Record<string, number[]> }>({
    queryKey: ['metrics-history'],
    queryFn: () => fetch('/api/metrics/history').then((res) => res.json()),
    refetchInterval: 30000, // History is heavy, keep polling for now or accept slightly stale lines
  })

  const history = historyData?.history || {}

  // Calculation derived from state
  const totalWaiting = queues.reduce((acc, q) => acc + q.waiting, 0)
  const totalDelayed = queues.reduce((acc, q) => acc + q.delayed, 0)
  const totalFailed = queues.reduce((acc, q) => acc + q.failed, 0)
  const activeWorkers = workers.length

  return (
    <div className="space-y-12">
      {selectedQueue && (
        <JobInspector queueName={selectedQueue} onClose={() => setSelectedQueue(null)} />
      )}

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">System Overview</h1>
          <p className="text-muted-foreground mt-2 text-sm font-bold opacity-60 uppercase tracking-widest">
            Real-time status of your processing pipelines.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-black text-green-500 bg-green-500/10 px-4 py-2 rounded-full border border-green-500/20 uppercase tracking-[0.2em] animate-pulse">
          <span className="w-2 h-2 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
          Live Syncing
        </div>
      </div>

      {/* KPI Header Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Waiting Jobs"
          value={totalWaiting}
          icon={<Hourglass size={20} />}
          color="text-amber-500"
          trend="+12% / hr"
          data={history.waiting}
        />
        <MetricCard
          title="Delayed Jobs"
          value={totalDelayed}
          icon={<Clock size={20} />}
          color="text-blue-500"
          trend="Stable"
          data={history.delayed}
        />
        <MetricCard
          title="Failed Jobs"
          value={totalFailed}
          icon={<AlertCircle size={20} />}
          color="text-red-500"
          trend={totalFailed > 0 ? 'CRITICAL' : 'CLEAN'}
          data={history.failed}
        />
        <MetricCard
          title="Active Workers"
          value={activeWorkers}
          icon={<Cpu size={20} />}
          color="text-indigo-500"
          trend={activeWorkers > 0 ? 'ONLINE' : 'IDLE'}
          data={history.workers}
        />
      </div>

      <ThroughputChart />

      <QueueHeatmap queues={queues} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <WorkerStatus highlightedWorkerId={hoveredWorkerId} workers={workers} />
        </div>
        <div className="lg:col-span-2">
          <LiveLogs onWorkerHover={setHoveredWorkerId} />
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black tracking-tight">Processing Queues</h2>
          <button className="text-[10px] font-black text-primary hover:underline flex items-center gap-2 uppercase tracking-widest opacity-60 hover:opacity-100 transition-opacity">
            View All Pipelines <ChevronRight size={14} />
          </button>
        </div>
        <div className="card-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-muted/10 text-muted-foreground uppercase text-[10px] font-black tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6">Pipeline Name</th>
                  <th className="px-8 py-6">Waiting</th>
                  <th className="px-8 py-6">Delayed</th>
                  <th className="px-8 py-6">Failed</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 text-sm">
                {queues.map((queue) => (
                  <tr key={queue.name} className="hover:bg-muted/5 transition-colors group">
                    <td className="px-8 py-6 font-black text-foreground flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/5 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 border border-primary/10">
                        <ListTree size={22} />
                      </div>
                      <span className="text-base tracking-tight">{queue.name}</span>
                    </td>
                    <td className="px-8 py-6 font-mono font-black text-lg">
                      {queue.waiting.toLocaleString()}
                    </td>
                    <td className="px-8 py-6 text-muted-foreground/80 font-bold">
                      {queue.delayed}
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={cn(
                          'font-mono font-black',
                          queue.failed > 0 ? 'text-red-500' : 'text-muted-foreground/40'
                        )}
                      >
                        {queue.failed}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <span
                        className={cn(
                          'px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm',
                          queue.failed > 0
                            ? 'bg-red-500 text-white border-red-600'
                            : queue.active > 0
                              ? 'bg-green-500/10 text-green-500 border-green-500/20'
                              : 'bg-muted/40 text-muted-foreground border-transparent'
                        )}
                      >
                        {queue.failed > 0 ? 'Critical' : queue.active > 0 ? 'Active' : 'Idle'}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-3 items-center">
                        {queue.delayed > 0 && (
                          <button
                            onClick={() =>
                              fetch(`/api/queues/${queue.name}/retry-all`, { method: 'POST' }).then(
                                () => queryClient.invalidateQueries({ queryKey: ['queues'] })
                              )
                            }
                            className="p-2.5 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all hover:scale-110 active:scale-90"
                            title="Retry All Delayed"
                          >
                            <RefreshCcw size={18} />
                          </button>
                        )}
                        {queue.failed > 0 && (
                          <button
                            onClick={() =>
                              fetch(`/api/queues/${queue.name}/retry-all-failed`, {
                                method: 'POST',
                              }).then(() => queryClient.invalidateQueries({ queryKey: ['queues'] }))
                            }
                            className="p-2.5 text-blue-500 hover:bg-blue-500/10 rounded-xl transition-all hover:scale-110 active:scale-90"
                            title="Retry All Failed"
                          >
                            <RefreshCcw size={18} />
                          </button>
                        )}
                        <button
                          onClick={async () => {
                            if (
                              confirm(
                                `Are you sure you want to purge all jobs in queue "${queue.name}"?`
                              )
                            ) {
                              await fetch(`/api/queues/${queue.name}/purge`, { method: 'POST' })
                              queryClient.invalidateQueries({ queryKey: ['queues'] })
                            }
                          }}
                          className="p-2.5 text-muted-foreground hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all hover:scale-110 active:scale-90"
                          title="Purge Queue"
                        >
                          <Trash2 size={18} />
                        </button>
                        <button
                          onClick={() => setSelectedQueue(queue.name)}
                          className="px-5 py-2.5 bg-muted text-foreground rounded-xl transition-all flex items-center gap-2 text-[11px] font-black uppercase tracking-widest border border-border/50 hover:border-primary/50 hover:bg-background shadow-sm active:scale-95"
                        >
                          Inspect <ArrowRight size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {queues.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-8 py-32 text-center text-muted-foreground">
                      <Activity size={48} className="mx-auto mb-4 opacity-10 animate-pulse" />
                      <p className="text-lg font-bold opacity-30 italic uppercase tracking-widest">
                        Waiting for bus activity...
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
