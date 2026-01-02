# Gravito Pulse Implementation Plan
**Version**: 1.1.0 (Beta Targeted)
**Status**: Active
**Target**: Zenith v1.0 Beta

This document outlines the implementation plan for the **System Pulse** and **Universal Queue Connector**, enabling Zenith to monitor not just Gravito Stream, but also Laravel, BullMQ, and other queue systems directly in the current Beta phase.

---

## 🏗 Architecture Specifications

### 1. Redis Schema (Updated)

| Key Pattern | Type | TTL | Description |
| :--- | :--- | :--- | :--- |
| `pulse:server:{app}:{id}` | `String` (JSON) | 30s | **Heartbeat**. System resources (CPU/RAM). |
| `pulse:queues:{app}` | `String` (JSON) | 30s | **Queue Snapshot**. Metrics from external queues. |
| `pulse:slow:{app}` | `Stream` | MaxLen 1000 | **Slow Logs**. Validated heavy requests. |

### 2. Gravito Pulse Protocol (GPP) - Shared Types

```typescript
// System Heartbeat
interface PulseHeartbeat {
  // ... (Existing fields)
}

// Universal Queue Snapshot
interface QueueSnapshot {
  timestamp: number;
  app: string;
  queues: Array<{
    name: string;
    driver: 'gravito-stream' | 'laravel-horizon' | 'bullmq' | 'sqs' | 'other';
    metrics: {
      waiting: number;
      active?: number | null; // Optional (some drivers can't count active)
      delayed?: number;
      failed?: number;
    };
    meta?: Record<string, any>;
  }>;
}
```

---

## 📅 Implementation Phases (Beta Priority)

### Phase 1: Foundation (Protocol & Node SDK)
**Goal**: Define the standard so other languages can conform.

- [ ] **Task 1.1: Create `packages/pulse-protocol`**
    - Define TypeScript interfaces for Heartbeat AND QueueSnapshot.
    - Export Redis key constants.

- [ ] **Task 1.2: Create `packages/pulse-node`**
    - Implement System Recorder (CPU/RAM).

### Phase 2: Universal Queue Adapters
**Goal**: Enable "One Dashboard, Any Queue".

- [ ] **Task 2.1: Laravel Adapter Specification (Concept)**
    - Target: `gravito/zenith-laravel` (Composer package).
    - Logic: 
        - Hook into Laravel Schedule.
        - Run `Redis::llen` on queue lists or query `failed_jobs` table.
        - Push JSON to `pulse:queues:{laravel_app}`.
    - *Action*: Create a POC documentation/spec for PHP developers.

- [ ] **Task 2.2: BullMQ Adapter (Node.js)**
    - Create `packages/adapter-bullmq`.
    - Wrapper that accepts a BullMQ queue instance and auto-reports metrics to Zenith.

### Phase 3: Zenith Integration (Aggregated UI)
**Goal**: Visualize mixed queue sources.

- [ ] **Task 3.1: Backend Aggregation**
    - `MonitorService` must now SCAN both `pulse:server:*` and `pulse:queues:*`.
    - Stream consolidated data via SSE.

- [ ] **Task 3.2: Unified Queue Dashboard**
    - Update `QueuesPage` to support "External Queues".
    - External queues might be "Read-Only" initially (Metrics only, no Retry controls yet).
    - Add visuals to distinguish Gravito Queues vs. External Queues.

---

## ⚡ Development Guidelines for External Adapters
1.  **Passive Reporting**: Adapters should strictly REPORT data. They should not rely on Zenith for commands in V1.
2.  **Fault Tolerance**: If Redis is down, the adapter must not crash the main application.
