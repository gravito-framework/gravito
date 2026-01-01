import { Photon } from '@gravito/photon'
import { serveStatic } from 'hono/bun'
import { streamSSE } from 'hono/streaming'
import { QueueService } from './services/QueueService'

const app = new Photon()

// Configuration
const PORT = parseInt(process.env.PORT || '3000')
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'
const QUEUE_PREFIX = process.env.QUEUE_PREFIX || 'queue:'

// Service Initialization
const queueService = new QueueService(REDIS_URL, QUEUE_PREFIX)

queueService
  .connect()
  .then(() => {
    console.log(`[FluxConsole] Connected to Redis at ${REDIS_URL}`)
    // Start background metrics recording
    setInterval(() => {
      queueService.recordStatusMetrics().catch(console.error)
    }, 60000)
    // Record initial snapshot
    queueService.recordStatusMetrics().catch(console.error)
  })
  .catch((err) => {
    console.error('[FluxConsole] Failed to connect to Redis', err)
  })

const api = new Photon()

api.get('/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }))

api.get('/queues', async (c) => {
  try {
    const queues = await queueService.listQueues()
    return c.json({ queues })
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Failed to list queues' }, 500)
  }
})

api.post('/queues/:name/retry-all', async (c) => {
  const name = c.req.param('name')
  try {
    const count = await queueService.retryDelayedJob(name)
    return c.json({ success: true, count })
  } catch (err) {
    return c.json({ error: 'Failed to retry jobs' }, 500)
  }
})

api.post('/queues/:name/retry-all-failed', async (c) => {
  const name = c.req.param('name')
  try {
    const count = await queueService.retryAllFailedJobs(name)
    return c.json({ success: true, count })
  } catch (err) {
    return c.json({ error: 'Failed to retry failed jobs' }, 500)
  }
})

api.get('/queues/:name/jobs', async (c) => {
  const name = c.req.param('name')
  const type = (c.req.query('type') as 'waiting' | 'delayed' | 'failed') || 'waiting'
  try {
    const jobs = await queueService.getJobs(name, type)
    return c.json({ jobs })
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Failed to fetch jobs' }, 500)
  }
})

api.get('/throughput', async (c) => {
  try {
    const data = await queueService.getThroughputData()
    return c.json({ data })
  } catch (err) {
    return c.json({ error: 'Failed to fetch throughput' }, 500)
  }
})

api.get('/workers', async (c) => {
  try {
    const workers = await queueService.listWorkers()
    return c.json({ workers })
  } catch (err) {
    return c.json({ error: 'Failed to fetch workers' }, 500)
  }
})

api.get('/metrics/history', async (c) => {
  try {
    const metrics = ['waiting', 'delayed', 'failed', 'workers']
    const history: Record<string, number[]> = {}

    await Promise.all(
      metrics.map(async (m) => {
        history[m] = await queueService.getMetricHistory(m)
      })
    )

    return c.json({ history })
  } catch (err) {
    return c.json({ error: 'Failed to fetch metrics history' }, 500)
  }
})

api.post('/queues/:name/jobs/delete', async (c) => {
  const queueName = c.req.param('name')
  const { type, raw } = await c.req.json()
  try {
    const success = await queueService.deleteJob(queueName, type, raw)
    return c.json({ success })
  } catch (err) {
    return c.json({ error: 'Failed to delete job' }, 500)
  }
})

api.post('/queues/:name/jobs/retry', async (c) => {
  const queueName = c.req.param('name')
  const { raw } = await c.req.json()
  try {
    const success = await queueService.retryJob(queueName, raw)
    return c.json({ success })
  } catch (err) {
    return c.json({ error: 'Failed to retry job' }, 500)
  }
})

api.post('/queues/:name/purge', async (c) => {
  const name = c.req.param('name')
  try {
    await queueService.purgeQueue(name)
    return c.json({ success: true })
  } catch (err) {
    return c.json({ error: 'Failed to purge queue' }, 500)
  }
})

api.get('/logs/stream', async (c) => {
  return streamSSE(c, async (stream) => {
    // 1. Send history first
    const history = await queueService.getLogHistory()
    for (const log of history) {
      await stream.writeSSE({
        data: JSON.stringify(log),
        event: 'log',
      })
    }

    // 2. Subscribe to new logs
    await queueService.subscribeLogs(async (msg) => {
      await stream.writeSSE({
        data: JSON.stringify(msg),
        event: 'log',
      })
    })

    // Keep alive
    while (true) {
      await stream.sleep(30000)
      await stream.writeSSE({ data: 'heartbeat', event: 'ping' })
    }
  })
})

app.route('/api', api)

app.use(
  '/*',
  serveStatic({
    root: './dist/client',
  })
)

app.get('*', serveStatic({ path: './dist/client/index.html' }))

console.log(`[FluxConsole] Server starting on http://localhost:${PORT}`)

export default {
  port: PORT,
  fetch: app.fetch,
}
