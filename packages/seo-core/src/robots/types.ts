export interface RobotsRule {
  userAgent: string
  allow?: string[]
  disallow?: string[]
  crawlDelay?: number
}

export interface RobotsConfig {
  rules: RobotsRule[]
  sitemapUrls?: string[]
  host?: string
}
