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
 * 
 * 從環境變數 VITE_STATIC_SITE_DOMAINS 讀取生產環境域名列表
 */
function isStaticSite(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const hostname = window.location.hostname

  // 從環境變數讀取靜態網站域名列表
  const staticDomainsEnv = import.meta.env.VITE_STATIC_SITE_DOMAINS || ''
  const staticDomains = staticDomainsEnv
    .split(',')
    .map((d: string) => d.trim())
    .filter((d: string) => d.length > 0)

  // 如果沒有配置環境變數，檢查常見的靜態託管域名模式
  if (staticDomains.length === 0) {
    return (
      hostname.includes('github.io') ||
      hostname.includes('vercel.app') ||
      hostname.includes('netlify.app') ||
      hostname.includes('pages.dev')
    )
  }

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

