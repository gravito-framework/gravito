import { usePage } from '@inertiajs/vue3'
import { computed } from 'vue'
import en from '../locales/en'
import zh from '../locales/zh'

const locales: Record<string, typeof en> = { en, zh }

export function useI18n() {
  const page = usePage()
  const locale = computed(() => (page.props.locale as string) || 'en')

  const t = computed(() => {
    // Force reactivity to page.props
    const currentLocale = (page.props.locale as string) || 'en'
    return locales[currentLocale] || locales.en
  })

  return {
    locale,
    t,
  }
}
