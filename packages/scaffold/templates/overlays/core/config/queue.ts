import { defineConfig } from '@gravito/core/queue'

export default defineConfig({
  default: 'sync',
  connections: {
    sync: {
      driver: 'sync',
    },
  },
})
