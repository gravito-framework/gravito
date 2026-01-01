import { Cpu, Activity } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function WorkerStatus({ highlightedWorkerId }: { highlightedWorkerId?: string | null }) {
    const { data: workerData } = useQuery<{ workers: any[] }>({
        queryKey: ['workers'],
        queryFn: async () => {
            const res = await fetch('/api/workers')
            return res.json()
        },
        refetchInterval: 5000
    })

    const workers = workerData?.workers || []
    const onlineCount = workers.filter(w => w.status === 'online').length

    return (
        <div className="card-premium p-6 h-full">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-lg font-black flex items-center gap-2 tracking-tight">
                        <Cpu size={20} className="text-primary" />
                        Cluster Nodes
                    </h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest opacity-60">Real-time load</p>
                </div>
                <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-3 py-1 rounded-full uppercase tracking-widest border border-green-500/20">
                    {onlineCount} ACTIVE
                </span>
            </div>

            <div className="space-y-3">
                {workers.length === 0 && (
                    <div className="py-12 text-center text-muted-foreground/30 flex flex-col items-center gap-2">
                        <Activity size={24} className="opacity-20 animate-pulse" />
                        <p className="text-[10px] font-black uppercase tracking-widest">No nodes connected</p>
                    </div>
                )}

                {workers.map((worker) => (
                    <div
                        key={worker.id}
                        className={cn(
                            "flex items-center justify-between p-4 rounded-2xl bg-muted/10 border transition-all group overflow-hidden relative",
                            worker.id === highlightedWorkerId
                                ? "border-primary/50 bg-primary/5 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)] -translate-y-1 scale-[1.02] z-10"
                                : "border-transparent hover:border-primary/20 hover:bg-muted/20"
                        )}
                    >
                        {/* Status bar */}
                        <div className={cn(
                            "absolute left-0 top-0 bottom-0 w-1 transition-all",
                            worker.status === 'online' ? "bg-green-500" : "bg-muted-foreground/30"
                        )} />

                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <div className={cn(
                                    "w-3 h-3 rounded-full",
                                    worker.status === 'online' ? 'bg-green-500 animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.6)]' : 'bg-muted-foreground/40'
                                )}></div>
                            </div>
                            <div>
                                <p className="text-sm font-black tracking-tight group-hover:text-primary transition-colors">{worker.id}</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black uppercase tracking-tighter opacity-50">{worker.status}</span>
                                    <span className="text-[9px] font-black text-primary/60">PID {worker.pid}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-6">
                            {worker.metrics && (
                                <div className="flex gap-4">
                                    <div className="space-y-1.5 w-16">
                                        <div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase tracking-tighter">
                                            <span>CPU</span>
                                            <span className={cn(worker.metrics.cpu > 0.8 && "text-red-500")}>{(worker.metrics.cpu * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-700",
                                                    worker.metrics.cpu > 0.8 ? "bg-red-500" : worker.metrics.cpu > 0.5 ? "bg-amber-500" : "bg-green-500"
                                                )}
                                                style={{ width: `${Math.min(100, worker.metrics.cpu * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-1.5 w-16">
                                        <div className="flex justify-between text-[8px] font-black text-muted-foreground uppercase tracking-tighter">
                                            <span>RAM</span>
                                            <span>{Math.round(worker.metrics.ram.rss / 1024)}G</span>
                                        </div>
                                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 transition-all duration-700"
                                                style={{ width: `${Math.min(100, (worker.metrics.ram.rss / 2048) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="text-right whitespace-nowrap hidden sm:block">
                                <p className="text-sm font-black tracking-tighter">{worker.uptime}s</p>
                                <p className="text-[8px] text-muted-foreground uppercase font-black tracking-widest opacity-50">UPTIME</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <button className="w-full mt-8 py-3 bg-muted text-[10px] font-black rounded-xl hover:bg-primary hover:text-primary-foreground transition-all uppercase tracking-[0.2em] opacity-60 hover:opacity-100 active:scale-95 shadow-lg shadow-transparent hover:shadow-primary/20">
                Manage Nodes
            </button>
        </div>
    )
}
