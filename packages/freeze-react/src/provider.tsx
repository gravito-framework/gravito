/**
 * @gravito/freeze-react - Context Provider
 *
 * React Context for SSG configuration and detector.
 */

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import { createDetector, type FreezeConfig, type FreezeDetector } from '@gravito/freeze'

/**
 * Freeze Context value
 */
export interface FreezeContextValue {
    config: FreezeConfig
    detector: FreezeDetector
    currentLocale: string
}

/**
 * Internal context (not exported directly)
 */
const FreezeContext = createContext<FreezeContextValue | null>(null)

/**
 * Props for FreezeProvider
 */
export interface FreezeProviderProps {
    /** SSG configuration */
    config: FreezeConfig
    /** Current locale (from URL or state) */
    locale?: string
    /** Child components */
    children: ReactNode
}

/**
 * Provider component for SSG functionality
 *
 * @example
 * ```tsx
 * import { FreezeProvider } from '@gravito/freeze-react'
 * import { freezeConfig } from './freeze.config'
 *
 * function App() {
 *   return (
 *     <FreezeProvider config={freezeConfig} locale="en">
 *       <Layout>...</Layout>
 *     </FreezeProvider>
 *   )
 * }
 * ```
 */
export function FreezeProvider({
    config,
    locale,
    children,
}: FreezeProviderProps) {
    const value = useMemo(() => {
        const detector = createDetector(config)
        const currentLocale = locale ?? detector.getCurrentLocale()

        return {
            config,
            detector,
            currentLocale,
        }
    }, [config, locale])

    return (
        <FreezeContext.Provider value={value}>{children}</FreezeContext.Provider>
    )
}

/**
 * Internal hook to get context value
 * Throws if used outside FreezeProvider
 */
export function useFreezeContext(): FreezeContextValue {
    const context = useContext(FreezeContext)
    if (!context) {
        throw new Error('useFreeze must be used within a FreezeProvider')
    }
    return context
}
