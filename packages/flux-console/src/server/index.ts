import { DB } from '@gravito/atlas'
import { Photon } from '@gravito/photon'
import { MySQLPersistence, SQLitePersistence } from '@gravito/stream'
import { serveStatic } from 'hono/bun'
import { getCookie } from 'hono/cookie'
import { streamSSE } from 'hono/streaming'
import {
  authMiddleware,
  createSession,
  destroySession,
  isAuthEnabled,
  verifyPassword,
} from './middleware/auth'
import { QueueService } from './services/QueueService'

const app = new Photon()

// Configuration
const PORT = parseInt(process.env.PORT || '3000', 10)
const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'
const QUEUE_PREFIX = process.env.QUEUE_PREFIX || 'queue:'

// Persistence Initialize
let persistence: { adapter: any; archiveCompleted: boolean; archiveFailed: boolean } | undefined

const dbDriver = process.env.DB_DRIVER || 'mysql'

if (dbDriver === 'sqlite' || process.env.DB_HOST) {
  if (dbDriver === 'sqlite') {
    DB.addConnection('default', {
      driver: 'sqlite',
      database: process.env.DB_NAME || 'flux.sqlite',
    })
  } else {
    DB.addConnection('default', {
      driver: dbDriver as any,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT || '3306', 10),
      database: process.env.DB_NAME || 'flux',
      username: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
    })
  }

  const adapter = dbDriver === 'sqlite' ? new SQLitePersistence(DB) : new MySQLPersistence(DB)
  adapter.setupTable().catch((err) => console.error('[FluxConsole] SQL Archive Setup Error:', err))

  persistence = {
    adapter,
    archiveCompleted: process.env.PERSIST_ARCHIVE_COMPLETED === 'true',
    archiveFailed: process.env.PERSIST_ARCHIVE_FAILED !== 'false',
  }
  console.log(`[FluxConsole] SQL Archive enabled via ${dbDriver}`)
}

// Service Initialization
const queueService = new QueueService(REDIS_URL, QUEUE_PREFIX, persistence)

queueService
  .connect()
  .then(() => {
    console.log(`[FluxConsole] Connected to Redis at ${REDIS_URL}`)
    // Start background metrics recording
    setInterval(() => {
      queueService.recordStatusMetrics().catch(console.error)
    }, 5000)

    // Start Scheduler Tick (every 10 seconds)
    setInterval(() => {
      queueService.tickScheduler().catch(console.error)
    }, 10000)

    // Record initial snapshot
    queueService.recordStatusMetrics().catch(console.error)
  })
  .catch((err) => {
    console.error('[FluxConsole] Failed to connect to Redis', err)
  })

const api = new Photon()

api.get('/health', (c) => c.json({ status: 'ok', time: new Date().toISOString() }))

// Auth endpoints (no middleware protection)
api.get('/auth/status', (c) => {
  const token = getCookie(c, 'flux_session')
  const isAuthenticated =
    !isAuthEnabled() || (token && require('./middleware/auth').validateSession(token))
  return c.json({
    enabled: isAuthEnabled(),
    authenticated: !!isAuthenticated,
  })
})

api.post('/auth/login', async (c) => {
  try {
    const { password } = await c.req.json()

    if (!verifyPassword(password)) {
      return c.json({ success: false, error: 'Invalid password' }, 401)
    }

    createSession(c)
    return c.json({ success: true })
  } catch (_err) {
    return c.json({ success: false, error: 'Login failed' }, 500)
  }
})

api.post('/auth/logout', (c) => {
  destroySession(c)
  return c.json({ success: true })
})

// Apply auth middleware to all other API routes
api.use('/*', authMiddleware)

api.get('/queues', async (c) => {
  try {
    const queues = await queueService.listQueues()
    return c.json({ queues })
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Failed to list queues' }, 500)
  }
})

api.get('/search', async (c) => {
  const query = c.req.query('q') || ''
  const type = (c.req.query('type') as 'all' | 'waiting' | 'delayed' | 'failed') || 'all'
  const limit = parseInt(c.req.query('limit') || '20', 10)

  if (!query || query.length < 2) {
    return c.json({ results: [], message: 'Query must be at least 2 characters' })
  }

  try {
    const results = await queueService.searchJobs(query, { type, limit })
    return c.json({ results, query, count: results.length })
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Search failed' }, 500)
  }
})

api.get('/archive/search', async (c) => {
  const query = c.req.query('q') || ''
  const queue = c.req.query('queue')
  const page = parseInt(c.req.query('page') || '1', 10)
  const limit = parseInt(c.req.query('limit') || '50', 10)

  if (!query) {
    return c.json({ results: [] })
  }

  try {
    const { jobs, total } = await queueService.searchArchive(query, { queue, page, limit })
    return c.json({ results: jobs, query, count: total })
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Archive search failed' }, 500)
  }
})

api.post('/queues/:name/retry-all', async (c) => {
  const name = c.req.param('name')
  try {
    const count = await queueService.retryDelayedJob(name)
    return c.json({ success: true, count })
  } catch (_err) {
    return c.json({ error: 'Failed to retry jobs' }, 500)
  }
})

api.post('/queues/:name/retry-all-failed', async (c) => {
  const name = c.req.param('name')
  try {
    const count = await queueService.retryAllFailedJobs(name)
    return c.json({ success: true, count })
  } catch (_err) {
    return c.json({ error: 'Failed to retry failed jobs' }, 500)
  }
})

api.post('/queues/:name/pause', async (c) => {
  const name = c.req.param('name')
  try {
    await queueService.pauseQueue(name)
    return c.json({ success: true, paused: true })
  } catch (_err) {
    return c.json({ error: 'Failed to pause queue' }, 500)
  }
})

api.post('/queues/:name/resume', async (c) => {
  const name = c.req.param('name')
  try {
    await queueService.resumeQueue(name)
    return c.json({ success: true, paused: false })
  } catch (_err) {
    return c.json({ error: 'Failed to resume queue' }, 500)
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

api.get('/queues/:name/archive', async (c) => {
  const name = c.req.param('name')
  const page = parseInt(c.req.query('page') || '1', 10)
  const limit = parseInt(c.req.query('limit') || '50', 10)
  const status = c.req.query('status') as 'completed' | 'failed' | undefined

  try {
    const { jobs, total } = await queueService.getArchiveJobs(name, page, limit, status)
    return c.json({ jobs, total })
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Failed to fetch archived jobs' }, 500)
  }
})

api.get('/throughput', async (c) => {
  try {
    const data = await queueService.getThroughputData()
    return c.json({ data })
  } catch (_err) {
    return c.json({ error: 'Failed to fetch throughput' }, 500)
  }
})

api.get('/workers', async (c) => {
  try {
    const workers = await queueService.listWorkers()
    return c.json({ workers })
  } catch (_err) {
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
  } catch (_err) {
    return c.json({ error: 'Failed to fetch metrics history' }, 500)
  }
})

api.get('/system/status', (c) => {
  const mem = process.memoryUsage()
  return c.json({
    node: process.version,
    memory: {
      rss: `${(mem.rss / 1024 / 1024).toFixed(2)} MB`,
      heapUsed: `${(mem.heapUsed / 1024 / 1024).toFixed(2)} MB`,
      total: '4.00 GB', // Hardcoded limit for demo aesthetic
    },
    engine: 'v0.1.0-beta.1',
    uptime: process.uptime(),
    env: process.env.NODE_ENV || 'production-east-1',
  })
})

api.post('/queues/:name/jobs/delete', async (c) => {
  const queueName = c.req.param('name')
  const { type, raw } = await c.req.json()
  try {
    const success = await queueService.deleteJob(queueName, type, raw)
    return c.json({ success })
  } catch (_err) {
    return c.json({ error: 'Failed to delete job' }, 500)
  }
})

api.post('/queues/:name/jobs/retry', async (c) => {
  const queueName = c.req.param('name')
  const { raw } = await c.req.json()
  try {
    const success = await queueService.retryJob(queueName, raw)
    return c.json({ success })
  } catch (_err) {
    return c.json({ error: 'Failed to retry job' }, 500)
  }
})

api.post('/queues/:name/jobs/bulk-delete', async (c) => {
  const queueName = c.req.param('name')
  const { type, raws } = await c.req.json()
  try {
    const deleted = await queueService.deleteJobs(queueName, type, raws)
    return c.json({ success: true, count: deleted })
  } catch (_err) {
    return c.json({ error: 'Failed to bulk delete' }, 500)
  }
})

api.post('/queues/:name/jobs/bulk-retry', async (c) => {
  const queueName = c.req.param('name')
  const { type, raws } = await c.req.json()
  try {
    const retried = await queueService.retryJobs(queueName, type, raws)
    return c.json({ success: true, count: retried })
  } catch (_err) {
    return c.json({ error: 'Failed to bulk retry' }, 500)
  }
})

api.post('/maintenance/cleanup-archive', async (c) => {
  const { days = 30 } = await c.req.json()
  try {
    const deleted = await queueService.cleanupArchive(days)
    return c.json({ success: true, deleted })
  } catch (_err) {
    return c.json({ error: 'Failed to cleanup archive' }, 500)
  }
})

api.post('/queues/:name/purge', async (c) => {
  const name = c.req.param('name')
  try {
    await queueService.purgeQueue(name)
    return c.json({ success: true })
  } catch (_err) {
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
    const unsubscribeLogs = queueService.onLog(async (msg) => {
      await stream.writeSSE({
        data: JSON.stringify(msg),
        event: 'log',
      })
    })

    // 3. Subscribe to real-time stats
    const unsubscribeStats = queueService.onStats(async (stats) => {
      await stream.writeSSE({
        data: JSON.stringify(stats),
        event: 'stats',
      })
    })

    stream.onAbort(() => {
      unsubscribeLogs()
      unsubscribeStats()
    })

    // Keep alive
    while (true) {
      await stream.sleep(5000)
      await stream.writeSSE({ data: 'heartbeat', event: 'ping' })
    }
  })
})

// --- Schedules ---
api.get('/schedules', async (c) => {
  try {
    const schedules = await queueService.listSchedules()
    return c.json({ schedules })
  } catch (_err) {
    return c.json({ error: 'Failed to list schedules' }, 500)
  }
})

api.post('/schedules', async (c) => {
  const body = await c.req.json()
  try {
    await queueService.registerSchedule(body)
    return c.json({ success: true })
  } catch (_err) {
    return c.json({ error: 'Failed to register schedule' }, 500)
  }
})

api.post('/schedules/run/:id', async (c) => {
  const id = c.req.param('id')
  try {
    await queueService.runScheduleNow(id)
    return c.json({ success: true })
  } catch (_err) {
    return c.json({ error: 'Failed to run schedule' }, 500)
  }
})

api.delete('/schedules/:id', async (c) => {
  const id = c.req.param('id')
  try {
    await queueService.removeSchedule(id)
    return c.json({ success: true })
  } catch (_err) {
    return c.json({ error: 'Failed to remove schedule' }, 500)
  }
})

// --- Alerting ---
api.get('/alerts/config', (c) => {
  return c.json({
    rules: queueService.alerts.getRules(),
    webhookEnabled: !!process.env.SLACK_WEBHOOK_URL,
  })
})

api.post('/alerts/test', async (c) => {
  try {
    queueService.alerts.check({
      queues: [],
      workers: [
        {
          id: 'test-node',
          hostname: 'localhost',
          pid: 0,
          uptime: 0,
          memory: { rss: '0', heapTotal: '0', heapUsed: '0' },
          queues: [],
        },
      ] as any,
      totals: { waiting: 9999, delayed: 0, failed: 9999 },
    })
    return c.json({ success: true, message: 'Test alert dispatched' })
  } catch (_err) {
    return c.json({ error: 'Test failed' }, 500)
  }
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
