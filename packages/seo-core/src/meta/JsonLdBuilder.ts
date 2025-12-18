import type { JsonLdConfig } from './interfaces'

export class JsonLdBuilder {
  constructor(private config: JsonLdConfig | JsonLdConfig[]) {}

  build(): string {
    const payload = Array.isArray(this.config)
      ? this.config.map((c) => this.format(c))
      : this.format(this.config)

    const jsonStr = JSON.stringify(payload).replace(/<\/script>/g, '<\\/script>')

    return `<script type="application/ld+json">${jsonStr}</script>`
  }

  private format(config: JsonLdConfig): Record<string, unknown> {
    return {
      '@context': 'https://schema.org',
      '@type': config.type,
      ...config.data,
    }
  }
}
