import { spawn } from 'node:child_process'
import { join } from 'node:path'

const PORT = 3007
const BASE_URL = `http://localhost:${PORT}`

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  console.log('--- Starting I18n Verification ---')

  const server = spawn('bun', ['run', 'src/index.ts'], {
    cwd: join(process.cwd(), 'examples/i18n-verification'),
    env: { ...process.env, PORT: PORT.toString() },
    stdio: 'inherit',
  })

  await sleep(2000)

  try {
    console.log('\n[Test 1] Default Locale (en)')
    const res1 = await fetch(`${BASE_URL}/?name=Carl`)
    const data1 = (await res1.json()) as any
    console.log('EN Response:', data1)

    if (
      data1.locale !== 'en' ||
      data1.hello !== 'Hello World' ||
      data1.welcome !== 'Welcome Carl'
    ) {
      throw new Error('Test 1 Failed')
    }

    console.log('\n[Test 2] Switch Locale via Header (zh)')
    const res2 = await fetch(`${BASE_URL}/?name=Carl`, {
      headers: { 'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7' },
    })
    const data2 = (await res2.json()) as any
    console.log('ZH Response:', data2)

    if (
      !data2.locale.startsWith('zh') ||
      data2.hello !== '你好世界' ||
      data2.welcome !== '歡迎 Carl'
    ) {
      throw new Error('Test 2 Failed')
    }

    console.log('\n✅ VERIFICATION SUCCESSFUL')
  } catch (e) {
    console.error('Verification failed:', e)
  } finally {
    server.kill()
  }
}

main()
