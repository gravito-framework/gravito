import { defineConfig } from '@gravito/core/cache'

export default defineConfig({
  default: 'memory',
  stores: {
    memory: {
      driver: 'memory',
    },
    file: {
      driver: 'file',
      path: 'storage/framework/cache',
    },
  },
})
