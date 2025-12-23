import { exec } from 'node:child_process'
import { cp, mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { promisify } from 'node:util'
import { bootstrap } from './src/bootstrap'

console.log('🏗️  Starting SSG Build for Luminosity site...')
process.env.NODE_ENV = 'production'

const execAsync = promisify(exec)

async function build() {
  // 1. Build Client Assets
  console.log('⚡ Building client assets (Vite)...')
  try {
    await execAsync('bun run build:client')
    console.log('✅ Client build complete.')
  } catch (e) {
    console.error('❌ Client build failed:', e)
    process.exit(1)
  }

  // 2. Initialize Core
  const core = await bootstrap({ port: 3000 })
  const outputDir = join(process.cwd(), 'dist-static')

  await mkdir(outputDir, { recursive: true })

  // Render Routes
  const routes = ['/', '/features', '/docs/introduction', '/docs/getting-started']

  // 3. Render Loop
  for (const pathname of routes) {
    console.log(`Render: ${pathname}`)
    try {
      const res = await (core.app as any).request(pathname)
      if (res.status !== 200) {
        console.error(`❌ Failed ${res.status}: ${pathname}`)
        console.error(await res.text())
        continue
      }

      const html = await res.text()
      const filePath = join(outputDir, pathname === '/' ? 'index.html' : `${pathname}/index.html`)
      await mkdir(dirname(filePath), { recursive: true })
      await writeFile(filePath, html)
      console.log(`✅ Rendered: ${pathname}`)
    } catch (e) {
      console.error(`❌ Error rendering ${pathname}:`, e)
    }
  }

  // 4. Copy static assets
  console.log('📦 Copying static assets...')
  try {
    const staticDir = join(process.cwd(), 'static')
    await cp(staticDir, join(outputDir, 'static'), { recursive: true })
  } catch (_e) {
    console.warn('⚠️  No static directory found or failed to copy.')
  }

  console.log('✅ SSG Build Complete!')
  process.exit(0)
}

build().catch((error) => {
  console.error('❌ Build failed:', error)
  process.exit(1)
})
