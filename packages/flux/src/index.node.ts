/**
 * @fileoverview Node.js compatible entry point
 *
 * This entry exports only platform-agnostic components.
 * BunSQLiteStorage is NOT included (use main entry for Bun).
 *
 * @module @gravito/flux
 */

// Core
export { FluxEngine } from './engine/FluxEngine'

// Builder
export { WorkflowBuilder, createWorkflow } from './builder/WorkflowBuilder'

// Storage (Node-compatible only)
export { MemoryStorage } from './storage/MemoryStorage'
// Note: BunSQLiteStorage is NOT exported here (Bun-only)

// Logger
export { FluxConsoleLogger, FluxSilentLogger } from './logger/FluxLogger'

// Gravito Integration
export { OrbitFlux, type OrbitFluxOptions } from './orbit/OrbitFlux'

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
