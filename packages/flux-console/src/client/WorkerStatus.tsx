import { Cpu } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function WorkerStatus() {
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
        <div className="bg-card border rounded-2xl p-6 shadow-sm h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                    <Cpu size={20} className="text-primary" />
                    Connect Workers
                </h3>
                <span className="text-[10px] font-bold text-green-500 bg-green-50 px-2 py-1 rounded-full uppercase tracking-tighter">
                    {onlineCount} Online
                </span>
            </div>
            <div className="space-y-4">
                {workers.map((worker) => (
                    <div key={worker.id} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-transparent hover:border-border transition-all">
                        <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${worker.status === 'online' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-muted-foreground'}`}></div>
                            <div>
                                <p className="text-xs font-bold">{worker.id}</p>
                                <p className="text-[10px] text-muted-foreground uppercase">{worker.status} • PID {worker.pid}</p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-2 shrink-0">
                            {worker.metrics && (
                                <div className="space-y-1.5 w-24">
                                    <div className="space-y-0.5">
                                        <div className="flex justify-between text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">
                                            <span>CPU</span>
                                            <span>{(worker.metrics.cpu * 100).toFixed(0)}%</span>
                                        </div>
                                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={cn(
                                                    "h-full transition-all duration-500",
                                                    worker.metrics.cpu > 0.8 ? "bg-red-500" : worker.metrics.cpu > 0.5 ? "bg-amber-500" : "bg-green-500"
                                                )}
                                                style={{ width: `${Math.min(100, worker.metrics.cpu * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-0.5">
                                        <div className="flex justify-between text-[8px] font-bold text-muted-foreground uppercase tracking-tighter">
                                            <span>RAM</span>
                                            <span>{worker.metrics.ram.rss}MB</span>
                                        </div>
                                        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-indigo-500 transition-all duration-500"
                                                style={{ width: `${Math.min(100, (worker.metrics.ram.rss / 1024) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="text-right">
                                <p className="text-[11px] font-black">{worker.uptime}s</p>
                                <p className="text-[8px] text-muted-foreground uppercase font-bold">UPTIME</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button className="w-full mt-6 py-2 bg-muted text-xs font-bold rounded-lg hover:bg-muted/80 transition-colors uppercase tracking-widest text-muted-foreground">
                Manage Cluster
            </button>
        </div>
    )
}
