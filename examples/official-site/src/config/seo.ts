import type { SeoConfig } from '@gravito/seo-core'
import { DocsService } from '../services/DocsService'

export const seoConfig: SeoConfig = {
  mode: 'dynamic',
  baseUrl: 'https://gravito.dev', // Replace with actual production URL if known
  robots: {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: ['/api'],
      },
      {
        userAgent: 'GPTBot',
        disallow: ['/'],
      },
    ],
    sitemapUrls: ['https://gravito.dev/sitemap.xml'],
  },
  resolvers: [
    {
      name: 'main-pages',
      fetch: async () => {
        const paths = [
          { url: '/', lastmod: new Date().toISOString() },
          { url: '/zh', lastmod: new Date().toISOString() },
          { url: '/about', lastmod: new Date().toISOString() },
          { url: '/zh/about', lastmod: new Date().toISOString() },
        ]

        // Docs paths
        const enDocs = DocsService.getSidebar('en').flatMap((s) => s.children || [])
        const zhDocs = DocsService.getSidebar('zh').flatMap((s) => s.children || [])

        for (const doc of enDocs) {
          paths.push({ url: doc.path, lastmod: new Date().toISOString() })
        }

        for (const doc of zhDocs) {
          paths.push({ url: doc.path, lastmod: new Date().toISOString() })
        }

        return paths
      },
    },
  ],
}
