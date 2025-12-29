import { defineConfig } from '@gravito/core/database'

export default defineConfig({
  default: 'sqlite',
  connections: {
    sqlite: {
      driver: 'sqlite',
      database: process.env.DB_DATABASE || 'gravito.sqlite',
    },
  },
})
