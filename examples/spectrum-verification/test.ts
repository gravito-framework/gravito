import { rmSync } from 'node:fs'
import { join } from 'node:path'
import { DB } from '@gravito/atlas'
import { FileStorage, SpectrumOrbit } from '@gravito/spectrum'
import { PlanetCore } from 'gravito-core'

const core = new PlanetCore()

// Clean up previous test data
const storageDir = join(process.cwd(), 'examples/spectrum-verification/storage')
try {
  rmSync(storageDir, { recursive: true, force: true })
} catch {}

// 1. Configure Atlas
DB.addConnection('default', {
  driver: 'sqlite',
  database: ':memory:',
})

// 2. Install Spectrum with FileStorage
await core.orbit(
  new SpectrumOrbit({
    storage: new FileStorage({ directory: storageDir }),
    // Simple gate: allow everything (mocking auth)
    gate: () => true,
  })
)

// 3. Define some routes
core.router.get('/hello', (c) => {
  core.logger.info('Hello route accessed')
  return c.json({ message: 'world', timestamp: Date.now() })
})

// 4. Simulate requests
console.log('--- Simulating requests ---')

const fetch = core.liftoff(3000).fetch

// Request 1: /hello
console.log('Requesting /hello...')
const res1 = await fetch(new Request('http://localhost/hello'))
const data1 = await res1.json()
console.log('Original Response:', data1)

// Check spectrum API
console.log('Checking Spectrum API...')
const reqRes = await fetch(new Request('http://localhost/gravito/spectrum/api/requests'))
const requests = await reqRes.json()

if (requests.length === 0) {
  console.error('❌ No requests captured')
  process.exit(1)
}

const capturedReq = requests[0]
console.log('Captured Request ID:', capturedReq.id)

// Test Replay
console.log('Testing Replay...')
const replayRes = await fetch(
  new Request(`http://localhost/gravito/spectrum/api/replay/${capturedReq.id}`, {
    method: 'POST',
  })
)
const replayData = await replayRes.json()
console.log('Replay Result:', replayData)

if (replayData.success && replayData.status === 200) {
  console.log('✅ Replay successful!')
} else {
  console.error('❌ Replay failed:', replayData)
  process.exit(1)
}

// Verify Persistence (create new storage instance and read)
console.log('Verifying Persistence...')
const storage2 = new FileStorage({ directory: storageDir })
await storage2.init()
const savedRequests = await storage2.getRequests()

const found = savedRequests.find((r) => r.id === capturedReq.id)

if (found) {
  console.log('✅ Persistence verified!')
} else {
  console.error('❌ Persistence failed: Data not found in new storage instance')
  console.error(
    'Saved Requests IDs:',
    savedRequests.map((r) => r.id)
  )
  process.exit(1)
}
