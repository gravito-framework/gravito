import { Rocket, Activity, Cpu, Terminal, Shield, Zap, Globe, Clock } from 'lucide-react'
import { useTelemetry } from './hooks/useTelemetry'
import { cn } from './utils'
import { useState, useEffect } from 'react'

/**
 * 資源進度條組件
 */
const MetricBar = ({ icon: Icon, label, value, colorClass }: any) => {
  const numericValue = parseInt(value) || 0
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center text-[10px] uppercase tracking-widest text-slate-500 font-bold">
        <div className="flex items-center gap-1.5">
          <Icon className="w-3 h-3" />
          {label}
        </div>
        <span className="text-slate-300">{value}</span>
      </div>
      <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
        <div 
          className={cn("h-full transition-all duration-1000 ease-out", colorClass)}
          style={{ width: `${Math.min(numericValue, 100)}%` }}
        ></div>
      </div>
    </div>
  )
}

function App() {
  const { logs, stats, connected } = useTelemetry()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const rockets = Array.from(new Set([...logs.map(l => l.rocketId), ...Object.keys(stats)]))

  return (
    <div className="min-h-screen text-slate-200 p-6 lg:p-10 selection:bg-sky-500/30">
      {/* Top Navigation / Status Bar */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 border-l-4 border-sky-500 pl-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-black tracking-tighter text-white">
              MISSION <span className="text-sky-400">CONTROL</span>
            </h1>
            <div className="px-2 py-0.5 bg-sky-500/10 border border-sky-500/20 rounded text-[10px] text-sky-400 font-bold tracking-widest uppercase">
              v0.2.0-Alpha
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
            <div className="flex items-center gap-1.5">
              <Globe className="w-3 h-3" />
              GRAVITO-NET-01
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              {time.toLocaleTimeString()}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6 bg-slate-900/50 backdrop-blur-md border border-slate-800 p-4 rounded-2xl">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">System Engine</span>
            <span className={cn("text-sm font-black", connected ? "text-emerald-400" : "text-rose-500")}>
              {connected ? 'STABLE' : 'OFFLINE'}
            </span>
          </div>
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-500",
            connected ? "bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "bg-rose-500/10 text-rose-500"
          )}>
            <Shield className={cn("w-6 h-6", connected && "animate-pulse-slow")} />
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {rockets.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-32 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/20">
            <Rocket className="w-12 h-12 text-slate-700 mb-4" />
            <h3 className="text-slate-500 font-bold uppercase tracking-widest">Scanning for active rockets...</h3>
            <p className="text-slate-600 text-xs mt-2 font-mono">No telemetry data received on channel 'telemetry'</p>
          </div>
        )}

        {rockets.map(rocketId => {
          const rocketStats = stats[rocketId]
          const rocketLogs = logs.filter(l => l.rocketId === rocketId).slice(-8)

          return (
            <div key={rocketId} className="group relative">
              {/* Glow Effect */}
              <div className="absolute -inset-0.5 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-3xl blur opacity-10 group-hover:opacity-30 transition duration-500"></div>
              
              <div className="relative bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden flex flex-col h-full shadow-2xl">
                
                {/* Card Header */}
                <div className="p-5 border-b border-slate-800/50 flex justify-between items-start">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
                      <Zap className="w-6 h-6 fill-current" />
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Rocket Identifier</div>
                      <div className="text-lg font-black text-white font-mono uppercase truncate w-40">{rocketId}</div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="px-3 py-1 rounded-full text-[9px] bg-emerald-500/10 text-emerald-400 font-black border border-emerald-500/20 tracking-widest uppercase">
                      Orbiting
                    </span>
                    <span className="text-[9px] text-slate-600 font-mono">ID: {rocketId.slice(-8)}</span>
                  </div>
                </div>

                {/* Telemetry Stats */}
                <div className="p-6 space-y-6 bg-slate-900/30">
                  <MetricBar 
                    icon={Cpu} 
                    label="CPU Load" 
                    value={rocketStats?.cpu || '0.00%'} 
                    colorClass="bg-sky-400 shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                  />
                  <MetricBar 
                    icon={Activity} 
                    label="Memory Usage" 
                    value={rocketStats?.memory.split('/')[0] || '0.0 MB'} 
                    colorClass="bg-indigo-400 shadow-[0_0_10px_rgba(129,140,248,0.5)]"
                  />
                </div>

                {/* Live Console */}
                <div className="flex-1 min-h-[240px] bg-black/60 p-5 font-mono text-[11px] relative group/terminal">
                  <div className="absolute top-4 right-4 text-slate-800 group-hover/terminal:text-sky-500/30 transition-colors">
                    <Terminal className="w-5 h-5" />
                  </div>
                  
                  <div className="space-y-2 overflow-y-auto max-h-52 pr-2">
                    {rocketLogs.length === 0 && (
                      <div className="flex items-center gap-2 text-slate-700 italic">
                        <span className="w-1 h-1 bg-slate-700 rounded-full animate-ping"></span>
                        Establishing uplink...
                      </div>
                    )}
                    {rocketLogs.map((log, i) => (
                      <div key={i} className="flex gap-3 text-slate-400 hover:text-slate-200 transition-colors">
                        <span className="text-sky-500/50 shrink-0 select-none">❯</span>
                        <span className="break-all leading-relaxed">{log.text}</span>
                      </div>
                    ))}
                  </div>
                  
                  {/* Fading bottom edge */}
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/80 to-transparent pointer-events-none"></div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex justify-end gap-3">
                   <button className="text-[10px] uppercase font-black tracking-widest text-slate-500 hover:text-white transition-colors">
                     Details
                   </button>
                   <button className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-black text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-sky-500/20">
                     Replay
                   </button>
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