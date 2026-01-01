import React from 'react'
import { Sidebar } from './Sidebar'
import { Bell, Search, User } from 'lucide-react'

interface LayoutProps {
    children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />

            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Top Header */}
                <header className="h-16 border-b bg-card/50 backdrop-blur-md flex items-center justify-between px-8 sticky top-0 z-10">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <input
                                type="text"
                                placeholder="Search queues, jobs, workers..."
                                className="w-full bg-muted/50 border rounded-lg py-2 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <button className="text-muted-foreground hover:text-foreground transition-colors relative">
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                        </button>
                        <div className="h-8 w-[1px] bg-border"></div>
                        <div className="flex items-center gap-3 cursor-pointer group">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-semibold group-hover:text-primary transition-colors">Admin User</p>
                                <p className="text-xs text-muted-foreground">Super Administrator</p>
                            </div>
                            <div className="w-9 h-9 bg-muted rounded-full flex items-center justify-center border shadow-sm group-hover:ring-2 group-hover:ring-primary/20 transition-all">
                                <User size={18} />
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-8 scrollbar-thin">
                    <div className="animate-in fade-in duration-500 fill-mode-both">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )
}
