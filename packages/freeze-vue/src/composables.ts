/**
 * @gravito/freeze-vue - Plugin and Composables
 *
 * Vue 3 plugin and composables for SSG functionality.
 */

import { createDetector, type FreezeConfig, type FreezeDetector } from '@gravito/freeze'
import { type App, type ComputedRef, computed, type InjectionKey, inject, provide } from 'vue'

/**
 * Freeze context value
 */
export interface FreezeContext {
  config: FreezeConfig
  detector: FreezeDetector
  currentLocale: ComputedRef<string>
}

/**
 * Injection key for Freeze context
 */
export const FREEZE_KEY: InjectionKey<FreezeContext> = Symbol('freeze')

/**
 * Vue Plugin for SSG functionality
 *
 * @example
 * ```typescript
 * // main.ts
 * import { createApp } from 'vue'
 * import { FreezePlugin, defineConfig } from '@gravito/freeze-vue'
 *
 * const config = defineConfig({
 *   staticDomains: ['example.com'],
 *   locales: ['en', 'zh'],
 *   defaultLocale: 'en',
 *   baseUrl: 'https://example.com',
 * })
 *
 * const app = createApp(App)
 * app.use(FreezePlugin, config)
 * app.mount('#app')
 * ```
 */
export const FreezePlugin = {
  install(app: App, config: FreezeConfig) {
    const detector = createDetector(config)

    const currentLocale = computed(() => {
      if (typeof window === 'undefined') {
        return config.defaultLocale
      }
      return detector.getLocaleFromPath(window.location.pathname)
    })

    const context: FreezeContext = {
      config,
      detector,
      currentLocale,
    }

    app.provide(FREEZE_KEY, context)
  },
}

/**
 * Composable return type
 */
export interface UseFreezeReturn {
  /** Whether currently in static site mode */
  isStatic: ComputedRef<boolean>
  /** Current locale */
  locale: ComputedRef<string>
  /** Get localized path */
  getLocalizedPath: (path: string, locale?: string) => string
  /** Switch locale while preserving path */
  switchLocale: (newLocale: string) => string
  /** Get current path locale */
  getLocaleFromPath: (path: string) => string
  /** Navigate to a different locale */
  navigateToLocale: (newLocale: string) => void
}

/**
 * Composable for accessing SSG utilities
 *
 * @example
 * ```vue
 * <script setup>
 * import { useFreeze } from '@gravito/freeze-vue'
 *
 * const { isStatic, locale, getLocalizedPath } = useFreeze()
 * </script>
 *
 * <template>
 *   <a :href="getLocalizedPath('/about')">About</a>
 * </template>
 * ```
 */
export function useFreeze(): UseFreezeReturn {
  const context = inject(FREEZE_KEY)

  if (!context) {
    throw new Error('useFreeze must be used within a Vue app with FreezePlugin installed')
  }

  const { detector, currentLocale } = context

  const isStatic = computed(() => detector.isStaticSite())

  const getLocalizedPath = (path: string, locale?: string): string => {
    return detector.getLocalizedPath(path, locale ?? currentLocale.value)
  }

  const switchLocale = (newLocale: string): string => {
    if (typeof window === 'undefined') {
      return `/${newLocale}`
    }
    return detector.switchLocale(window.location.pathname, newLocale)
  }

  const getLocaleFromPath = (path: string): string => {
    return detector.getLocaleFromPath(path)
  }

  const navigateToLocale = (newLocale: string): void => {
    if (typeof window !== 'undefined') {
      const newPath = switchLocale(newLocale)
      window.location.href = newPath
    }
  }

  return {
    isStatic,
    locale: currentLocale,
    getLocalizedPath,
    switchLocale,
    getLocaleFromPath,
    navigateToLocale,
  }
}

/**
 * Provide freeze context manually (for SSR or custom setups)
 */
export function provideFreeze(config: FreezeConfig): FreezeContext {
  const detector = createDetector(config)

  const currentLocale = computed(() => {
    if (typeof window === 'undefined') {
      return config.defaultLocale
    }
    return detector.getLocaleFromPath(window.location.pathname)
  })

  const context: FreezeContext = {
    config,
    detector,
    currentLocale,
  }

  provide(FREEZE_KEY, context)

  return context
}
