import { createInertiaApp } from '@inertiajs/vue3'
import { createApp, type DefineComponent, h } from 'vue'
import './app.css'

createInertiaApp({
  resolve: (name) => {
    const pages = import.meta.glob('./pages/**/*.vue', { eager: true })
    return pages[`./pages/${name}.vue`] as DefineComponent
  },
  setup({ el, App, props, plugin }) {
    createApp({ render: () => h(App, props) })
      .use(plugin)
      .mount(el)
  },
})
