import React from 'react'
import {
    LayoutDashboard,
    ListTree,
    HardDrive,
    Activity,
    Settings,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import { cn } from './utils'
import { motion } from 'framer-motion'

interface SidebarProps {
    className?: string
}

export function Sidebar({ className }: SidebarProps) {
    const [collapsed, setCollapsed] = React.useState(false)

    const navItems = [
        { icon: LayoutDashboard, label: 'Overview', active: true },
        { icon: ListTree, label: 'Queues', active: false },
        { icon: HardDrive, label: 'Workers', active: false },
        { icon: Activity, label: 'Metrics', active: false },
        { icon: Settings, label: 'Settings', active: false },
    ]

    return (
        <aside
            className={cn(
                "h-screen bg-card border-r flex flex-col transition-all duration-300 ease-in-out relative group z-20",
                collapsed ? "w-20" : "w-64",
                className
            )}
        >
            {/* Logo */}
            <div className="p-6 flex items-center gap-4">
                <div className="relative group/logo cursor-pointer">
                    {/* System Heartbeat Background Pulse */}
                    <div className="absolute inset-0 bg-primary/20 rounded-xl animate-ping scale-150 opacity-0 group-hover/logo:opacity-100 transition-opacity duration-1000"></div>
                    <div className="absolute inset-0 bg-primary/10 rounded-xl glow-pulse"></div>

                    <div className="w-10 h-10 bg-gradient-to-br from-primary to-indigo-600 text-primary-foreground rounded-xl flex items-center justify-center shadow-xl shadow-primary/20 group-hover:rotate-12 transition-all duration-500 relative z-10">
                        <Activity size={22} className="group-hover:scale-110 transition-transform" />
                    </div>
                </div>
                {!collapsed && (
                    <div className="font-black text-xl tracking-tighter leading-none animate-in fade-in slide-in-from-left-2">
                        GRAVITO <span className="text-primary block text-[10px] tracking-[0.3em] uppercase opacity-70 mt-1">Flux Engine</span>
                    </div>
                )}
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item, i) => (
                    <button
                        key={i}
                        className={cn(
                            "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-muted-foreground group/item relative overflow-hidden",
                            item.active
                                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 hover:scale-[1.02]"
                                : "hover:bg-muted font-medium hover:text-foreground active:scale-95"
                        )}
                    >
                        <item.icon size={22} className={cn(
                            "transition-all",
                            item.active ? "scale-110" : "group-hover/item:scale-110"
                        )} />
                        {!collapsed && <span className="font-semibold whitespace-nowrap tracking-tight">{item.label}</span>}
                        {item.active && (
                            <motion.div
                                layoutId="active-pill"
                                className="absolute left-0 w-1 h-6 bg-primary-foreground rounded-r-full"
                            />
                        )}
                    </button>
                ))}
            </nav>

            {/* Footer / Toggle */}
            <div className="p-4 border-t border-border/50">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center h-10 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-90"
                >
                    {collapsed ? <ChevronRight size={20} /> : <div className="flex items-center gap-2 px-2"><ChevronLeft size={18} /> <span className="text-xs font-black uppercase tracking-widest">Collapse Sidebar</span></div>}
                </button>
            </div>
        </aside>
    )
}
