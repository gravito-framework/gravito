# Flux Saga Pattern & Compensation - Implementation Plan

## Objective
Implement a robust **Saga Pattern** mechanism in Flux to achieve eventual consistency in distributed transactions. This allows defining `compensate` handlers for steps, which are automatically executed in reverse order when a workflow phase fails.

## 1. Type Definitions Updates (`src/types.ts`)

### 1.1 Step Definition
Add an optional `compensate` handler to `StepDefinition`.

```typescript
export interface StepDefinition<TInput = any, TData = any> {
  // ... existing
  name: string
  handler: (ctx: WorkflowContext<TInput, TData>) => Promise<void | FluxWaitResult> | void | FluxWaitResult
  
  /**
   * Compensation handler to undo the effects of this step
   * Executed when a subsequent step fails and the workflow enters rollback mode
   */
  compensate?: (ctx: WorkflowContext<TInput, TData>) => Promise<void> | void
}
```

### 1.2 Step Execution Status
Need to track if a step has been "compensated".

```typescript
export interface StepExecution {
  // ... existing
  status: 'pending' | 'running' | 'completed' | 'failed' | 'skipped' | 'suspended' | 'compensated' | 'compensating'
  // compensatedAt?
}
```

### 1.3 Workflow Status
Add rolling back status.

```typescript
export type WorkflowStatus = 'pending' | 'running' | 'paused' | 'completed' | 'failed' | 'suspended' | 'rolling_back' | 'rolled_back'
```

## 2. Builder Update (`src/builder/WorkflowBuilder.ts`)

Update `.step()` signature to accept an options object that includes `compensate`.

```typescript
// Current:
// .step(name, handler, options)

// New overload or update options:
.step(name, handler, {
  retries: 3,
  compensate: async (ctx) => { ... }
})
```

## 3. Engine Core Logic (`src/engine/FluxEngine.ts`)

### 3.1 Failure Handling
When a step fails (after retries exhausted):
1. **Check Strategy**: Does this workflow enable compensation? (Default: yes, or maybe explicit).
2. **Transition**: Change workflow status to `rolling_back`.
3. **Rollback Loop**:
   - Iterate backwards from `currentStep - 1` down to `0`.
   - For each step:
     - Check if it has a defined `compensate` handler.
     - Check if the step was actually `completed` (don't compensate failed/skipped steps).
     - Execute `compensate` handler.
     - Update step status to `compensated`.
     - Emit trace event `step:compensate`.
4. **Final State**:
   - If all compensations succeed -> `rolled_back`.
   - If compensation fails -> `failed` (with a catastrophic error, maybe `compensation_failed`).

### 3.2 State Machine (`src/core/StateMachine.ts`)
Update transitions map to support:
- `rolling_back` -> `rolled_back`
- `rolling_back` -> `failed`
- `running` -> `rolling_back`

## 4. Trace Events (`src/types.ts`)
Add:
- `workflow:rollback_start`
- `workflow:rollback_complete`
- `step:compensate`

## 5. Execution Plan

1.  **Modify Types**: Add `compensate` to definitions and new statuses.
2.  **Update Builder**: Allow passing `compensate`.
3.  **Implement Rollback Logic**: In `FluxEngine`, create a `rollback()` method.
4.  **Integration**: Call `rollback()` when `executor.execute()` fails comprehensively.
5.  **Test**: Create `tests/saga.test.ts` and `examples/saga-trip-booking.ts`.
