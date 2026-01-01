import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './Layout'
import {
    OverviewPage,
    QueuesPage,
    WorkersPage,
    MetricsPage,
    SettingsPage
} from './pages'

const queryClient = new QueryClient()

function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        <Route path="/" element={<OverviewPage />} />
                        <Route path="/queues" element={<QueuesPage />} />
                        <Route path="/workers" element={<WorkersPage />} />
                        <Route path="/metrics" element={<MetricsPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </QueryClientProvider>
    )
}

export default App
