# @gravito/flux-console

Management and Monitoring UI for Gravito Stream.

## Features

- **Real-time Monitoring**: Throughput and error rates.
- **Worker Health**: Live CPU and RAM metrics.
- **Queue Management**: Waiting, Delayed, and Failed (DLQ) job inspection.
- **Batch Actions**: Flush delayed jobs, retry all failed jobs.

## Development

```bash
# Start backend and frontend (proxy mode)
bun run dev

# Seed test data
bun scripts/seed-data.ts

# Start demo worker
bun scripts/demo-worker.ts
```

## Technical Specification

See [ARCHITECTURE.md](./ARCHITECTURE.md) and [DOCS_INTERNAL.md](./DOCS_INTERNAL.md) for implementation details.
