# @gravito/stream

Lightweight, high-performance queueing for Gravito. Supports multiple storage drivers, embedded and standalone workers, and flexible job serialization.

**Status**: v0.1.0 - core features complete with Memory, Database, Redis, Kafka, and SQS drivers.

## Features

- **Zero runtime overhead**: Thin wrappers that delegate to drivers
- **Multi-driver support**: Memory, Database, Redis, Kafka, SQS, RabbitMQ
- **Modular**: Install only the driver you need (core < 50KB)
- **Embedded or standalone workers**: Run in-process during development or standalone in production
- **AI-friendly**: Strong typing, clear JSDoc, and predictable APIs
- **Custom Retry Strategies**: Built-in exponential backoff with per-job overrides
- **Dead Letter Queue (DLQ)**: Automatic handling of permanently failed jobs

## Installation

```bash
bun add @gravito/stream
```

## Quick Start

### 1. Define a job

```typescript
import { Job } from '@gravito/stream'

export class SendWelcomeEmail extends Job {
  constructor(private userId: string) {
    super()
  }

  async handle(): Promise<void> {
    const user = await User.find(this.userId)
    await mail.send(new WelcomeEmail(user))
  }
}
```

### 2. Enqueue a job

```typescript
const queue = c.get('queue')

await queue.push(new SendWelcomeEmail(user.id))
  .onQueue('emails')
  .delay(60)
```

### 3. Configure OrbitStream (Memory driver)

```typescript
import { OrbitStream } from '@gravito/stream'

const core = await PlanetCore.boot({
  orbits: [
    OrbitStream.configure({
      default: 'memory',
      connections: {
        memory: { driver: 'memory' }
      },
      autoStartWorker: true,
      workerOptions: {
        queues: ['default', 'emails']
      }
    })
  ]
})
```

## Database Driver Example

```typescript
import { OrbitStream } from '@gravito/stream'

// Create a database service adapter that implements DatabaseService interface
const dbService = {
  execute: async (sql, bindings) => yourDbClient.query(sql, bindings),
  transaction: async (callback) => yourDbClient.transaction(callback),
}

const core = await PlanetCore.boot({
  orbits: [
    OrbitStream.configure({
      default: 'database',
      connections: {
        database: {
          driver: 'database',
          table: 'jobs',
          dbService: dbService // Pass your database service
        }
      }
    })
  ]
})
```

## RabbitMQ Driver Example

```typescript
import { OrbitStream } from '@gravito/stream'
import amqp from 'amqplib'

const connection = await amqp.connect('amqp://localhost')

const core = await PlanetCore.boot({
  orbits: [
    OrbitStream.configure({
      default: 'rabbitmq',
      connections: {
        rabbitmq: {
          driver: 'rabbitmq',
          client: connection,
          exchange: 'gravito.events',
          exchangeType: 'fanout'
        }
      }
    })
  ]
})
```

## Database Schema

```sql
CREATE TABLE jobs (
  id BIGSERIAL PRIMARY KEY,
  queue VARCHAR(255) NOT NULL,
  payload TEXT NOT NULL,
  attempts INT DEFAULT 0,
  reserved_at TIMESTAMP,
  available_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_jobs_queue_available ON jobs(queue, available_at);
CREATE INDEX idx_jobs_reserved ON jobs(reserved_at);
```

## Standalone Worker

```bash
bun run packages/orbit-queue/cli/queue-worker.ts \
  --connection=database \
  --queues=default,emails \
  --workers=4
```

## API Reference

### Job

```typescript
abstract class Job implements Queueable {
  abstract handle(): Promise<void>
  async failed(error: Error): Promise<void>

  onQueue(queue: string): this
  onConnection(connection: string): this
  delay(seconds: number): this
  
  /**
   * Set retry backoff strategy.
   * @param seconds - Initial delay in seconds
   * @param multiplier - Multiplier for each subsequent attempt (default: 2)
   */
  backoff(seconds: number, multiplier = 2): this
}
```

### QueueManager

```typescript
class QueueManager {
  async push<T extends Job>(job: T): Promise<T>
  async pushMany<T extends Job>(jobs: T[]): Promise<void>
  async pop(queue?: string, connection?: string): Promise<Job | null>
  async size(queue?: string, connection?: string): Promise<number>
  async clear(queue?: string, connection?: string): Promise<void>
  async complete(job: Job): Promise<void>
  async fail(job: Job, error: Error): Promise<void>
  registerJobClasses(jobClasses: Array<new (...args: unknown[]) => Job>): void
}
```

## Implemented Drivers

- **MemoryDriver** - in-memory (development)
- **DatabaseDriver** - PostgreSQL/MySQL/SQLite
- **RedisDriver** - delayed jobs supported
- **KafkaDriver** - topics and consumer groups
- **SQSDriver** - standard/FIFO queues and long polling
- **RabbitMQDriver** - exchanges, queues, and advanced confirm mode

## License

MIT
