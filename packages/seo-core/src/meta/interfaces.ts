export interface MetaConfig {
  title: string
  description?: string
  keywords?: string[]
  canonical?: string
  robots?: string
}

export interface OpenGraphConfig {
  type?: 'website' | 'article' | 'product' | 'profile' | string
  title: string
  description?: string
  image?: string | { url: string; width?: number; height?: number; alt?: string }
  url?: string
  siteName?: string
  locale?: string
  alternateLocales?: string[]
}

export interface TwitterCardConfig {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player'
  site?: string
  creator?: string
  title?: string
  description?: string
  image?: string
}

export interface JsonLdConfig {
  type: string
  data: Record<string, unknown>
}

export interface AnalyticsConfig {
  gtag?: string // G-XXXXXXX
  pixel?: string // FB Pixel
  baidu?: string // Baidu HM
}

export interface PageSeoConfig {
  meta: MetaConfig
  og?: OpenGraphConfig
  twitter?: TwitterCardConfig
  jsonLd?: JsonLdConfig | JsonLdConfig[]
  analytics?: AnalyticsConfig
}
