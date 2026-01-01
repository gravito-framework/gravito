import React from 'react'
import {
    LayoutDashboard,
    ListTree,
    HardDrive,
    Activity,
    Settings,
    ChevronLeft,
    ChevronRight,
    Terminal
} from 'lucide-react'
import { cn } from './utils'

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
                "h-screen bg-card border-r flex flex-col transition-all duration-300 ease-in-out relative group",
                collapsed ? "w-20" : "w-64",
                className
            )}
        >
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-lg">
                    <Terminal size={24} />
                </div>
                {!collapsed && (
                    <div className="font-bold text-xl tracking-tight">
                        Gravito <span className="text-blue-600">Flux</span>
                    </div>
                )}
            </div>

            {/* Nav Items */}
            <nav className="flex-1 px-4 py-6 space-y-2">
                {navItems.map((item, i) => (
                    <button
                        key={i}
                        className={cn(
                            "w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all hover:bg-muted/50 text-muted-foreground group/item",
                            item.active && "bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:text-primary-foreground"
                        )}
                    >
                        <item.icon size={22} className={cn(!item.active && "group-hover/item:text-foreground transition-colors")} />
                        {!collapsed && <span className="font-medium whitespace-nowrap">{item.label}</span>}
                    </button>
                ))}
            </nav>

            {/* Footer / Toggle */}
            <div className="p-4 border-t">
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="w-full flex items-center justify-center p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
                >
                    {collapsed ? <ChevronRight size={20} /> : <div className="flex items-center gap-2"><ChevronLeft size={20} /> <span className="text-sm font-medium">Collapse</span></div>}
                </button>
            </div>
        </aside>
    )
}
