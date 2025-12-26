import { spawn } from 'node:child_process'
import { join } from 'node:path'

const PORT = 3003
const BASE_URL = `http://localhost:${PORT}`

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function main() {
  console.log('--- Starting Auth & Security Verification ---')

  const server = spawn('bun', ['run', 'src/index.ts'], {
    cwd: join(process.cwd(), 'examples/auth-verification'),
    env: { ...process.env, PORT: PORT.toString() },
    stdio: 'inherit',
  })

  await sleep(2000)

  try {
    console.log('\n[Test 1] Register User')
    const regRes = await fetch(`${BASE_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'user@example.com',
        password: 'password123',
        password_confirmation: 'password123',
        role: 'user', // Note: In a real app we wouldn't let user pick role via registration
      }),
    })
    console.log('Register status:', regRes.status)
    const cookie = regRes.headers.get('Set-Cookie')
    console.log('Session Cookie received:', cookie ? 'YES' : 'NO')

    console.log('\n[Test 2] Access Protected User Route')
    const userRes = await fetch(`${BASE_URL}/user`, {
      headers: { Cookie: cookie || '' },
    })
    const userData = await userRes.json()
    console.log('User status:', userRes.status, userData)

    console.log('\n[Test 3] Access Admin Route as User (Should Fail)')
    const adminFailRes = await fetch(`${BASE_URL}/admin`, {
      headers: { Cookie: cookie || '' },
    })
    console.log('Admin Access status (User):', adminFailRes.status)

    console.log('\n[Test 4] Manual Login as Admin')
    const loginRes = await fetch(`${BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@example.com',
        password: 'adminpassword',
      }),
    })
    const adminCookie = loginRes.headers.get('Set-Cookie')
    console.log('Login status:', loginRes.status)

    console.log('\n[Test 5] Access Admin Route as Admin (Should Pass)')
    const adminPassRes = await fetch(`${BASE_URL}/admin`, {
      headers: { Cookie: adminCookie || '' },
    })
    const adminData = await adminPassRes.json()
    console.log('Admin Access status (Admin):', adminPassRes.status, adminData)

    if (adminPassRes.status === 200 && adminData.message === 'Welcome Admin') {
      console.log('\n✅ VERIFICATION SUCCESSFUL')
    } else {
      console.log('\n❌ VERIFICATION FAILED')
    }
  } catch (e) {
    console.error('Verification failed:', e)
  } finally {
    server.kill()
  }
}

main()
