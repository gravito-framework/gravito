import { Rocket, Cpu, Activity, Terminal, Shield, Globe, Clock, LayoutGrid, Radio, AlertTriangle } from 'lucide-react'
import { useTelemetry } from './hooks/useTelemetry'
import { cn } from './utils'
import { useState, useEffect } from 'react'

/**
 * 工業級數據讀數組件
 */
const DataReadout = ({ label, value, unit, colorClass }: any) => (
  <div className="bg-black/40 border border-white/5 p-3 rounded shadow-inner">
    <div className="text-[9px] uppercase text-slate-500 font-bold mb-1 tracking-tighter">{label}</div>
    <div className="flex items-baseline gap-1">
      <span className={cn("text-xl font-black font-mono tracking-tighter", colorClass)}>{value}</span>
      <span className="text-[10px] text-slate-600 font-bold">{unit}</span>
    </div>
  </div>
)

function App() {
  const { logs, stats, connected } = useTelemetry()
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const rockets = Array.from(new Set([...logs.map(l => l.rocketId), ...Object.keys(stats)]))

  return (
    <div className="h-screen w-screen ground-control-bg relative flex flex-col overflow-hidden">
      <div className="scanline animate-scanline"></div>

      {/* 🟢 TOP STATUS BAR (HOUSTON HEADER) */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/60 backdrop-blur-sm z-20">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-sky-500 flex items-center justify-center rounded-sm rotate-45 shadow-[0_0_15px_rgba(14,165,233,0.4)]">
              <Rocket className="w-6 h-6 text-black -rotate-45" />
            </div>
            <div>
              <div className="text-sm font-black tracking-widest text-white leading-none">GRAVITO GROUND STATION</div>
              <div className="text-[9px] text-sky-500 font-mono mt-1 tracking-[0.3em]">HOUSTON / LAUNCH CONTROL</div>
            </div>
          </div>
          <div className="hidden md:flex gap-6 border-l border-white/10 pl-8">
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 font-bold uppercase">Uplink Status</span>
              <span className={cn("text-[10px] font-mono font-bold", connected ? "text-emerald-400" : "text-rose-500")}>
                {connected ? '● SECURE CONNECTION' : '○ NO SIGNAL'}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-[8px] text-slate-500 font-bold uppercase">System Time</span>
              <span className="text-[10px] font-mono text-slate-300 font-bold">{time.toISOString().replace('T', ' ').slice(0, 19)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded text-emerald-400">
             <div className="text-[8px] uppercase font-bold tracking-tighter leading-none mb-1">Mission Clock</div>
             <div className="text-lg font-mono font-black tabular-nums leading-none">T+{Math.floor(time.getTime()/1000) % 100000}</div>
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden">
        
        {/* 🟡 LEFT SIDEBAR (RESOURCES) */}
        <aside className="w-64 border-r border-white/5 bg-black/40 p-6 flex flex-col gap-8 hidden lg:flex">
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-4 h-4 text-slate-500" />
              <h2 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">System Integrity</h2>
            </div>
            <div className="space-y-3">
              <DataReadout label="Active Rockets" value={rockets.length} unit="UNITS" colorClass="text-sky-400" />
              <DataReadout label="Pool Capacity" value="85" unit="%" colorClass="text-emerald-400" />
              <DataReadout label="Uplink Rate" value="1.2" unit="MB/S" colorClass="text-amber-400" />
            </div>
          </section>

          <section className="flex-1">
             <div className="flex items-center gap-2 mb-4">
              <Radio className="w-4 h-4 text-slate-500" />
              <h2 className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Live Frequency</h2>
            </div>
            <div className="h-32 bg-sky-500/5 border border-sky-500/10 rounded-sm relative overflow-hidden group">
               {/* 16 根具備非同步、不對稱跳動感的線條 */}
               <div className="absolute inset-0 flex items-center justify-around px-4 gap-1.5">
                  {[...Array(16)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-1.5 bg-sky-500/40 rounded-full transition-all duration-700 group-hover:bg-sky-400/60" 
                      style={{ 
                        height: `${20 + Math.random() * 40}%`,
                        animation: `chaotic-signal ${1 + Math.random() * 2.5}s cubic-bezier(0.45, 0.05, 0.55, 0.95) ${i * 0.13}s infinite`,
                        boxShadow: '0 0 8px rgba(14, 165, 233, 0.05)'
                      }}
                    ></div>
                  ))}
               </div>
            </div>
            
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes chaotic-signal {
                0% { transform: scaleY(1); opacity: 0.3; }
                15% { transform: scaleY(1.4); opacity: 0.6; }
                30% { transform: scaleY(0.7); opacity: 0.4; }
                55% { transform: scaleY(1.8); opacity: 0.8; }
                70% { transform: scaleY(0.9); opacity: 0.5; }
                85% { transform: scaleY(1.3); opacity: 0.7; }
                100% { transform: scaleY(1); opacity: 0.3; }
              }
            `}} />
          </section>
        </aside>

        {/* 🔵 CENTER STAGE (MISSION GRID) */}
        <section className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          {rockets.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-20">
              <LayoutGrid className="w-24 h-24 mb-6" />
              <div className="text-xl font-black tracking-[0.5em]">STANDING BY</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {rockets.map(rocketId => {
                const rocketStats = stats[rocketId]
                const rocketLogs = logs.filter(l => l.rocketId === rocketId).slice(-12)

                return (
                  <div key={rocketId} className="bg-[#0a0a0a] border-2 border-white/5 rounded shadow-2xl overflow-hidden flex flex-col">
                    {/* Module Header */}
                    <div className="p-4 bg-white/5 border-b border-white/5 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-emerald-500 rounded-sm animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                        <span className="text-xs font-black font-mono tracking-widest text-white">{rocketId}</span>
                      </div>
                      <div className="flex gap-4">
                        <div className="text-right">
                          <div className="text-[8px] text-slate-500 font-bold uppercase leading-none">Telemetry Node</div>
                          <div className="text-[10px] font-mono text-sky-500 font-bold">NODE-{rocketId.slice(-4).toUpperCase()}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row divide-x divide-white/5 h-full">
                      {/* Left: Quick Stats */}
                      <div className="p-5 flex flex-col gap-4 w-full md:w-48 bg-black/20">
                        <div className="space-y-1">
                          <div className="text-[8px] text-slate-500 uppercase font-bold">Propulsion (CPU)</div>
                          <div className="text-lg font-mono font-black text-white">{rocketStats?.cpu || '0.0%'}</div>
                          <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.5)]" style={{ width: rocketStats?.cpu || '0%' }}></div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[8px] text-slate-500 uppercase font-bold">Payload (MEM)</div>
                          <div className="text-[11px] font-mono font-bold text-slate-300">{rocketStats?.memory.split('/')[0] || '0 MB'}</div>
                        </div>
                        <div className="mt-auto pt-4 border-t border-white/5">
                           <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-bold tracking-widest animate-pulse">
                             <Shield className="w-3 h-3" />
                             NOMINAL
                           </div>
                        </div>
                      </div>

                      {/* Right: Terminal */}
                      <div className="flex-1 bg-black p-4 font-mono text-[10px] min-h-[200px] flex flex-col relative">
                        <div className="absolute top-2 right-2 text-white/5 uppercase font-black tracking-widest select-none">Log Stream</div>
                        <div className="flex-1 overflow-y-auto space-y-1 pr-2 custom-scrollbar">
                          {rocketLogs.length === 0 && <div className="text-slate-800">{"\u003e\u003e\u003e"} ESTABLISHING DATALINK...</div>}
                          {rocketLogs.map((log, i) => (
                            <div key={i} className="flex gap-2">
                              <span className="text-sky-500/40 select-none">[{new Date(log.timestamp).toTimeString().slice(0, 8)}]</span>
                              <span className="text-slate-400 leading-tight">{log.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>
      </main>

      {/* 🔴 FOOTER CONSOLE (GLOBAL COMMAND LOG) */}
      <footer className="h-12 border-t border-white/10 bg-black flex items-center px-6 gap-8 z-20">
        <div className="flex items-center gap-2 text-sky-500 shrink-0">
          <Terminal className="w-4 h-4" />
          <span className="text-[10px] font-black uppercase tracking-widest">Global Terminal</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <div className="text-[10px] font-mono text-slate-500 truncate animate-pulse">
            {logs.length > 0 ? `\u003e Incoming data from ${logs[logs.length-1].rocketId}: ${logs[logs.length-1].text}` : '\u003e SYSTEM READY. STANDING BY FOR MISSION ASSIGNMENT...'}
          </div>
        </div>
        <div className="flex gap-4 text-[9px] font-bold uppercase tracking-tighter text-slate-600">
          <span>TX: ENABLED</span>
          <span>RX: SECURE</span>
          <span className="text-emerald-500">AUTO-RECYCLE: ACTIVE</span>
        </div>
      </footer>
    </div>
  )
}

export default App
