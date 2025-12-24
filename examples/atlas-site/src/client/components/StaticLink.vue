<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'

interface Props {
  to?: string
  href?: string
  class?: string
}

const props = defineProps<Props>()
const route = useRoute()

/**
 * 檢測是否在靜態網站環境中
 */
const isStaticSite = (): boolean => {
  if (typeof window === 'undefined') return false

  const hostname = window.location.hostname
  const port = window.location.port

  // 靜態預覽模式 (Vite preview 通常使用 4173)
  if ((hostname === 'localhost' || hostname === '127.0.0.1') && (port === '4173' || port === '5000')) {
    return true
  }

  // 檢查是否在 GitHub Pages 或特定靜態 Domain
  const staticDomains = ['gravito.dev', 'gravito-framework.github.io']
  return staticDomains.includes(hostname)
}

const target = computed(() => props.to || props.href || '#')
const isStatic = computed(() => isStaticSite())

// 判斷是否為外部連結
const isExternal = computed(() => {
  return target.value.startsWith('http') || target.value.startsWith('//')
})
</script>

<template>
  <!-- 如果是外部連結，永遠使用 <a> -->
  <a v-if="isExternal" :href="target" :class="props.class" target="_blank" rel="noopener noreferrer">
    <slot />
  </a>

  <!-- 在靜態環境中，強制使用 <a> 標籤，並確保路徑以 .html 結尾（視靜態化配置而定） -->
  <!-- 這裡我們保留原始路徑，但使用 <a> 標籤來觸發硬跳轉，避免 SPA 路由在靜態化後失效 -->
  <a v-else-if="isStatic" :href="target" :class="props.class">
    <slot />
  </a>

  <!-- 在開發環境或 SPA 環境中，使用 router-link -->
  <router-link v-else :to="target" :class="props.class">
    <slot />
  </router-link>
</template>
