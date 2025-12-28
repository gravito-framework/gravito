import { Rocket, Activity, Cpu, Terminal } from 'lucide-react'
import { useTelemetry } from './hooks/useTelemetry'
import { cn } from './utils'

function App() {
  const { logs, stats, connected } = useTelemetry()

  // Group logs by rocket
  const rockets = Array.from(new Set([...logs.map(l => l.rocketId), ...Object.keys(stats)]))

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8">
      {/* Header */}
      <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <Rocket className="w-8 h-8 text-sky-400" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight">GRAVITO <span className="text-sky-400">LAUNCHPAD</span></h1>
            <p className="text-xs text-slate-500 font-mono mt-1">MISSION CONTROL CENTER</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full animate-pulse", connected ? "bg-emerald-500" : "bg-rose-500")}></div>
          <span className="text-xs font-mono text-slate-400">{connected ? 'SYSTEM ONLINE' : 'DISCONNECTED'}</span>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rockets.length === 0 && (
          <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-800 rounded-lg text-slate-600">
            NO ACTIVE MISSIONS
          </div>
        )}

        {rockets.map(rocketId => {
          const rocketStats = stats[rocketId]
          const rocketLogs = logs.filter(l => l.rocketId === rocketId).slice(-5)

          return (
            <div key={rocketId} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl hover:border-sky-500/30 transition-all group">
              {/* Card Header */}
              <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center group-hover:bg-slate-800/50">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 font-bold text-xs">
                    R{rocketId.slice(-2)}
                  </div>
                  <span className="font-mono text-sm font-bold text-slate-300">{rocketId}</span>
                </div>
                <span className="px-2 py-1 rounded text-[10px] bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20">
                  ORBITING
                </span>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-px bg-slate-800">
                <div className="bg-slate-900 p-4 flex flex-col items-center justify-center gap-1">
                  <Cpu className="w-4 h-4 text-slate-500" />
                  <span className="text-lg font-bold text-white">{rocketStats?.cpu || '0%'}</span>
                  <span className="text-[10px] text-slate-500 uppercase">CPU Usage</span>
                </div>
                <div className="bg-slate-900 p-4 flex flex-col items-center justify-center gap-1">
                  <Activity className="w-4 h-4 text-slate-500" />
                  <span className="text-lg font-bold text-white">{rocketStats?.memory.split('/')[0] || '0MB'}</span>
                  <span className="text-[10px] text-slate-500 uppercase">Memory</span>
                </div>
              </div>

              {/* Terminal Preview */}
              <div className="p-4 bg-black font-mono text-[10px] h-48 overflow-hidden relative">
                <div className="absolute top-2 right-2 opacity-20">
                  <Terminal className="w-4 h-4" />
                </div>
                <div className="space-y-1">
                  {rocketLogs.length === 0 && <span className="text-slate-600 italic">Waiting for telemetry...</span>}
                  {rocketLogs.map((log, i) => (
                    <div key={i} className="text-slate-300 break-all">
                      <span className="text-slate-600 mr-2">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                      {log.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default App