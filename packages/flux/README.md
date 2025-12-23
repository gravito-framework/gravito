# @gravito/flux

> ⚡ Platform-agnostic, high-performance workflow engine for Gravito

## Features

- **Pure State Machine** - No runtime dependencies, Web Standard APIs only
- **Fluent Builder API** - Type-safe, chainable workflow definitions
- **Storage Adapters** - Memory (built-in), SQLite, PostgreSQL (coming soon)
- **Retry & Timeout** - Automatic retry with exponential backoff
- **Event Hooks** - Subscribe to workflow/step lifecycle events

## Installation

```bash
bun add @gravito/flux
```

## Quick Start

```typescript
import { FluxEngine, createWorkflow } from '@gravito/flux'

// 1. Define workflow
const orderFlow = createWorkflow('order-process')
  .input<{ orderId: string }>()
  .step('fetch', async (ctx) => {
    ctx.data.order = await db.orders.find(ctx.input.orderId)
  })
  .step('validate', async (ctx) => {
    if (!ctx.data.order.isPaid) throw new Error('Unpaid order')
  })
  .commit('fulfill', async (ctx) => {
    await fulfillment.ship(ctx.data.order)
  })

// 2. Execute
const engine = new FluxEngine()
const result = await engine.execute(orderFlow, { orderId: '123' })

if (result.status === 'completed') {
  console.log('Order processed:', result.data)
}
```

## API

### `createWorkflow(name)`

Create a workflow builder.

```typescript
const flow = createWorkflow('my-workflow')
  .input<{ value: number }>()   // Define input type
  .step('step1', handler)        // Add step
  .step('step2', handler, opts)  // With options
  .commit('save', handler)       // Commit step (always runs)
```

### `FluxEngine`

Execute workflows.

```typescript
const engine = new FluxEngine({
  storage: new MemoryStorage(),   // Default
  defaultRetries: 3,              // Default retry count
  defaultTimeout: 30000,          // Default 30s timeout
  on: {
    stepStart: (step, ctx) => {},
    stepComplete: (step, ctx, result) => {},
    stepError: (step, ctx, error) => {},
    workflowComplete: (ctx) => {},
    workflowError: (ctx, error) => {},
  }
})

const result = await engine.execute(workflow, input)
```

### Step Options

```typescript
.step('name', handler, {
  retries: 5,                    // Override retry count
  timeout: 60000,                // Override timeout (ms)
  when: (ctx) => ctx.data.x > 0, // Conditional execution
})
```

### Commit Steps

Commit steps are marked to always execute, even on workflow replay:

```typescript
.commit('save-to-db', async (ctx) => {
  await db.insert(ctx.data)  // Side effect
})
```

## Storage Adapters

### MemoryStorage (Default)

In-memory, for development:

```typescript
import { MemoryStorage } from '@gravito/flux'
const engine = new FluxEngine({ storage: new MemoryStorage() })
```

### Custom Storage

Implement `WorkflowStorage` interface:

```typescript
interface WorkflowStorage {
  save(state: WorkflowState): Promise<void>
  load(id: string): Promise<WorkflowState | null>
  list(filter?: WorkflowFilter): Promise<WorkflowState[]>
  delete(id: string): Promise<void>
  init?(): Promise<void>
  close?(): Promise<void>
}
```

## License

MIT
