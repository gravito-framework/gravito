import { SeoMetadata } from '@gravito/seo-core'
import { getTranslation } from '../services/I18nService'

export function generateSeoHtml(locale: string, title?: string, description?: string) {
  const t = getTranslation(locale)

  const seo = new SeoMetadata({
    meta: {
      title: title || t.site.title,
      description: description || t.site.description,
      keywords: t.site.keywords.split(',').map((k: string) => k.trim()),
    },
    og: {
      title: title || t.site.title,
      type: 'website',
      siteName: 'Gravito Framework',
    },
    twitter: {
      card: 'summary_large_image',
    },
    analytics: {
      gtag: process.env.GA_MEASUREMENT_ID, // E.g., G-XXXXXXXXXX
    },
  })

  return seo.toString()
}
