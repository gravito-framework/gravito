# @gravito/freeze-vue

> @gravito/freeze 的 Vue 3 轉接器，提供 SSG 相關元件與組合式函式。

## 安裝

```bash
bun add @gravito/freeze-vue
```

## 快速開始

```vue
<script setup lang="ts">
import { FreezeProvider, defineConfig } from '@gravito/freeze-vue'

const config = defineConfig({
  staticDomains: ['example.com', 'example.github.io'],
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  baseUrl: 'https://example.com',
})
</script>

<template>
  <FreezeProvider :config="config">
    <Layout />
  </FreezeProvider>
</template>
```
