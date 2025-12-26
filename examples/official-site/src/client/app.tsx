import { createInertiaApp } from '@inertiajs/react'
import { createRoot } from 'react-dom/client'
import { FreezeProvider } from '@gravito/freeze-react'
import './styles.css'
import { freezeConfig } from './freeze.config'

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./pages/**/*.tsx', { eager: true })
    // Standard Vite glob import
    return pages[`./pages/${name}.tsx`]
  },
  setup({ el, App, props }) {
    const locale = (props?.initialPage?.props?.locale as string) || 'en'
    createRoot(el).render(
      <FreezeProvider config={freezeConfig} locale={locale}>
        <App {...props} />
      </FreezeProvider>
    )
  },
})
