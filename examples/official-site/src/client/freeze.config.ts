import { defineConfig } from '@gravito/freeze'

export const freezeConfig = defineConfig({
  staticDomains: ['gravito.dev'],
  locales: ['en', 'zh'],
  defaultLocale: 'en',
  baseUrl: 'https://gravito.dev',
  redirects: [],
})
