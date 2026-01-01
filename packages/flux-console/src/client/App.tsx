import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './Layout'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import {
    OverviewPage,
    QueuesPage,
    WorkersPage,
    MetricsPage,
    SettingsPage,
    LoginPage
} from './pages'
import { RefreshCcw } from 'lucide-react'

const queryClient = new QueryClient()

function AuthenticatedRoutes() {
    const { isAuthenticated, isAuthEnabled, isLoading } = useAuth()

    // Show loading spinner while checking auth
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <RefreshCcw className="animate-spin text-primary" size={48} />
                    <p className="text-muted-foreground font-bold uppercase tracking-[0.3em] text-xs">
                        Initializing...
                    </p>
                </div>
            </div>
        )
    }

    // If auth is enabled and user is not authenticated, show login
    if (isAuthEnabled && !isAuthenticated) {
        return <LoginPage />
    }

    // Otherwise, show the main app
    return (
        <Layout>
            <Routes>
                <Route path="/" element={<OverviewPage />} />
                <Route path="/queues" element={<QueuesPage />} />
                <Route path="/workers" element={<WorkersPage />} />
                <Route path="/metrics" element={<MetricsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
            </Routes>
        </Layout>
    )
}

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <AuthProvider>
                    <AuthenticatedRoutes />
                </AuthProvider>
            </BrowserRouter>
        </QueryClientProvider>
    )
}

export default App
