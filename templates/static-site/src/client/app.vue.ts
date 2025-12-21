import { createInertiaApp } from '@inertiajs/vue3'
import { createApp } from 'vue'
import './styles.css'

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./pages/**/*.vue', { eager: true })
    return pages[`./pages/${name}.vue`]
  },
  setup({ el, App, props, plugin }) {
    createApp({ render: () => App }).use(plugin).mount(el)
  },
})
