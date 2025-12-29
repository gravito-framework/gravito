import { defineConfig } from '@gravito/core/database'

export default defineConfig({
  default: 'pgsql',
  connections: {
    pgsql: {
      driver: 'pgsql',
      host: process.env.DB_HOST || '127.0.0.1',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_DATABASE || 'gravito',
      username: process.env.DB_USERNAME || 'gravito',
      password: process.env.DB_PASSWORD || 'secret',
    },
  },
})
