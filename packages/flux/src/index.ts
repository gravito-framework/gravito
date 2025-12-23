/**
 * @fileoverview @gravito/flux - Platform-agnostic Workflow Engine
 *
 * High-performance, type-safe workflow engine with Bun optimizations.
 *
 * @example Basic Usage
 * ```typescript
 * import { FluxEngine, createWorkflow } from '@gravito/flux'
 *
 * const workflow = createWorkflow('order-process')
 *   .input<{ orderId: string }>()
 *   .step('validate', async (ctx) => {
 *     ctx.data.order = await fetchOrder(ctx.input.orderId)
 *   })
 *   .step('process', async (ctx) => {
 *     await processPayment(ctx.data.order)
 *   })
 *   .commit('notify', async (ctx) => {
 *     await sendEmail(ctx.data.order.email)
 *   })
 *
 * const engine = new FluxEngine()
 * const result = await engine.execute(workflow, { orderId: '123' })
 * ```
 *
 * @module @gravito/flux
 */

// Core
export { FluxEngine } from './engine/FluxEngine'

// Builder
export { WorkflowBuilder, createWorkflow } from './builder/WorkflowBuilder'

// Storage
export { MemoryStorage } from './storage/MemoryStorage'
export { BunSQLiteStorage, type BunSQLiteStorageOptions } from './storage/BunSQLiteStorage'

// Logger
export { FluxConsoleLogger, FluxSilentLogger } from './logger/FluxLogger'

// Core (for advanced usage)
export { StateMachine } from './core/StateMachine'
export { StepExecutor } from './core/StepExecutor'
export { ContextManager } from './core/ContextManager'

// Types
export type {
    // Core types
    WorkflowStatus,
    WorkflowContext,
    WorkflowState,
    WorkflowDefinition,
    // Step types
    StepDefinition,
    StepExecution,
    StepResult,
    // Storage
    WorkflowStorage,
    WorkflowFilter,
    // Logger
    FluxLogger,
    // Config
    FluxConfig,
    FluxResult,
} from './types'

