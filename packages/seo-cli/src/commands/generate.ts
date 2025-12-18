import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { ConfigLoader, SeoEngine, XmlStreamBuilder } from '@gravito/seo-core'
import pc from 'picocolors'

export async function generateCommand(options: { config?: string; out?: string }) {
  try {
    const loader = new ConfigLoader()
    const config = await loader.load(options.config)

    // Override output path if CLI arg provided
    const outputPath = options.out
      ? options.out
      : config.output?.path
        ? join(config.output.path, config.output.filename || 'sitemap.xml')
        : 'sitemap.xml'

    console.log(pc.dim('Loading engine...'))
    const engine = new SeoEngine(config)
    await engine.init()

    console.log(pc.dim('Fetching entries...'))
    const strategy = engine.getStrategy()
    const entries = await strategy.getEntries()

    console.log(pc.dim(`Generating XML for ${entries.length} URLs...`))
    const builder = new XmlStreamBuilder({
      baseUrl: config.baseUrl,
      branding: config.branding?.enabled,
    })
    const xml = builder.buildFull(entries)

    // Ensure directory exists
    const dir = dirname(outputPath)
    await mkdir(dir, { recursive: true })

    await writeFile(outputPath, xml)

    console.log(pc.green(`\n✅ Sitemap generated at: ${outputPath}`))
    console.log(pc.dim(`   Total URLs: ${entries.length}`))
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(pc.red('\n❌ Generation failed:'), message)
    process.exit(1)
  }
}
