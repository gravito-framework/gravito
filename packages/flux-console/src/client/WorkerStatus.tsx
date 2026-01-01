import { Cpu } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'

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
                        <div className="text-right">
                            <p className="text-xs font-black">{worker.uptime}s</p>
                            <p className="text-[10px] text-muted-foreground uppercase">UPTIME</p>
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
