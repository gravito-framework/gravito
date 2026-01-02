import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { Activity, Cpu, Database, Laptop, Server } from 'lucide-react'
import { motion } from 'framer-motion'
import { PulseNode } from '../../shared/types'
import { PageHeader } from '../components/PageHeader'
import { cn } from '../utils'

// Helper to format bytes
const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

function NodeCard({ node }: { node: PulseNode }) {
    const isHealthy = Date.now() - node.timestamp < 30000 // 30s threshold
    const isWarning = !isHealthy && Date.now() - node.timestamp < 60000 // 60s warning

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card border border-border/50 rounded-xl p-4 shadow-sm relative overflow-hidden group"
        >
            {/* Background Pulse Effect */}
            <div className={cn(
                "absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl opacity-10 rounded-bl-full transition-all duration-500",
                isHealthy ? "from-emerald-500 to-transparent" : isWarning ? "from-yellow-500 to-transparent" : "from-red-500 to-transparent"
            )} />

            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className={cn(
                        "w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg",
                        node.language === 'node' ? 'bg-[#339933]' :
                            node.language === 'php' ? 'bg-[#777BB4]' :
                                node.language === 'go' ? 'bg-[#00ADD8]' :
                                    node.language === 'python' ? 'bg-[#3776AB]' : 'bg-gray-500'
                    )}>
                        {node.language === 'node' && <span className="font-bold text-xs">JS</span>}
                        {node.language === 'php' && <span className="font-bold text-xs">PHP</span>}
                        {node.language === 'go' && <span className="font-bold text-xs">GO</span>}
                        {node.language !== 'node' && node.language !== 'php' && node.language !== 'go' && <span className="font-bold text-xs">?</span>}
                    </div>
                    <div>
                        <h3 className="font-bold text-foreground text-sm flex items-center gap-2">
                            {node.id}
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground uppercase tracking-wider">{node.platform}</span>
                        </h3>
                        <div className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <Laptop size={10} /> {node.hostname} <span className="opacity-30">|</span> PID: {node.pid}
                        </div>
                    </div>
                </div>
                <div className={cn(
                    "w-2.5 h-2.5 rounded-full shadow-[0_0_10px_currentColor]",
                    isHealthy ? "bg-emerald-500 text-emerald-500" : isWarning ? "bg-yellow-500 text-yellow-500" : "bg-red-500 text-red-500"
                )} />
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-3">
                {/* CPU */}
                <div className="bg-muted/30 rounded-lg p-2.5 border border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Cpu size={12} /> CPU Usage
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-foreground">{node.cpu.usage}%</span>
                        <span className="text-[10px] text-muted-foreground">/ {node.cpu.cores} cores</span>
                    </div>
                    {/* Mini Bar */}
                    <div className="h-1 w-full bg-muted rounded-full mt-2 overflow-hidden">
                        <div
                            className={cn("h-full rounded-full transition-all duration-500", node.cpu.usage > 80 ? 'bg-red-500' : 'bg-primary')}
                            style={{ width: `${Math.min(node.cpu.usage, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Memory */}
                <div className="bg-muted/30 rounded-lg p-2.5 border border-border/50">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                        <Database size={12} /> RAM Usage
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-foreground">{formatBytes(node.memory.rss)}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                        Heap: {formatBytes(node.memory.heapUsed)}
                    </div>
                </div>
            </div>

            <div className="mt-3 pt-3 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                    <Server size={10} /> {node.runtime.framework}
                </span>
                <span>
                    Ups: {Math.floor(node.runtime.uptime / 60)}m
                </span>
            </div>
        </motion.div>
    )
}

function ServiceGroup({ service, nodes }: { service: string, nodes: PulseNode[] }) {
    return (
        <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
                <div className="h-px flex-1 bg-border/50" />
                <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    {service}
                    <span className="bg-muted text-foreground px-2 py-0.5 rounded-md text-xs">{nodes.length}</span>
                </h2>
                <div className="h-px flex-1 bg-border/50" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {nodes.map(node => (
                    <NodeCard key={node.id} node={node} />
                ))}
            </div>
        </div>
    )
}

export function PulsePage() {
    const { data: initialData, isLoading } = useQuery<{ nodes: Record<string, PulseNode[]> }>({
        queryKey: ['pulse-nodes'],
        queryFn: async () => {
            const res = await fetch('/api/pulse/nodes')
            return res.json()
        },
        // Remove polling
    })

    const [nodes, setNodes] = useState<Record<string, PulseNode[]>>({})

    // Hydrate initial data
    useEffect(() => {
        if (initialData?.nodes) {
            setNodes(initialData.nodes)
        }
    }, [initialData])

    // Listen for SSE updates
    useEffect(() => {
        const handler = (e: Event) => {
            const customEvent = e as CustomEvent
            if (customEvent.detail?.nodes) {
                setNodes(customEvent.detail.nodes)
            }
        }
        window.addEventListener('flux-pulse-update', handler)
        return () => window.removeEventListener('flux-pulse-update', handler)
    }, [])

    // Loading Skeleton
    if (isLoading && Object.keys(nodes).length === 0) {
        return (
            <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 animate-pulse">
                <div className="h-8 w-48 bg-muted rounded-lg" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="h-48 bg-muted rounded-xl" />)}
                </div>
            </div>
        )
    }

    const services = Object.entries(nodes)

    return (
        <div className="min-h-screen bg-background text-foreground pb-20">
            <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
                <PageHeader
                    icon={Activity}
                    title="System Pulse"
                    description="Real-time infrastructure monitoring across your entire stack."
                >
                    <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground bg-muted px-3 py-1.5 rounded-lg border border-border/50">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        LIVE CONNECTION
                    </div>
                </PageHeader>

                {services.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-border rounded-xl">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <Activity className="text-muted-foreground" size={32} />
                        </div>
                        <h3 className="text-lg font-bold">No Pulse Signals Detected</h3>
                        <p className="text-muted-foreground max-w-sm mt-2">
                            Start a worker with the pulse agent enabled or check your Redis connection.
                        </p>
                    </div>
                ) : (
                    <div>
                        {services.map(([service, nodes]) => (
                            <ServiceGroup key={service} service={service} nodes={nodes} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
