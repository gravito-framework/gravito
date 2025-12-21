<template>
  <component :is="linkComponent" v-bind="linkProps">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { Link } from '@inertiajs/vue3'
import { computed } from 'vue'

interface Props {
  href: string
  as?: string
  method?: string
  data?: Record<string, any>
  replace?: boolean
  preserveScroll?: boolean
  preserveState?: boolean
  only?: string[]
  except?: string[]
  headers?: Record<string, string>
  queryStringArrayFormat?: 'brackets' | 'indices'
  class?: string
  [key: string]: any
}

const props = defineProps<Props>()

/**
 * 檢測是否在靜態網站環境中（GitHub Pages、Vercel、Netlify 等）
 * 在靜態環境中，沒有後端伺服器處理 Inertia 的 AJAX 請求，
 * 因此需要使用普通的 <a> 標籤進行完整頁面導航
 */
function isStaticSite(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const hostname = window.location.hostname
  // 在此添加您的生產環境域名
  const staticDomains = [
    'gravito.dev',
    // 如果需要，可以添加 GitHub Pages 模式
    // hostname.includes('github.io')
  ]

  return staticDomains.includes(hostname)
}

const isStatic = isStaticSite()

const linkComponent = computed(() => {
  return isStatic ? 'a' : Link
})

const linkProps = computed(() => {
  if (isStatic) {
    // 在靜態環境中，使用普通的 <a> 標籤
    const { href, class: className, ...rest } = props
    return {
      href,
      class: className,
      ...rest,
    }
  }

  // 在動態環境中，使用 Inertia Link
  return props
})
</script>

