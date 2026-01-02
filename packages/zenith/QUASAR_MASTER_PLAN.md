# 🌌 Project Quasar: Master Implementation Plan

**Version**: 1.0.0 (Unified)
**Target**: Zenith v1.0
**Context**: This document supersedes all previous "Pulse" plans. It is the single source of truth for the Quasar monitoring ecosystem.

---

## 1. Vision & Identity

**Quasar** is the comprehensive observability layer for the Gravito ecosystem. It unifies infrastructure monitoring (CPU/RAM), application insights (Queues/Slow Logs), and availability checks into a single stream.

> **Slogan**: *"The brightest signal in your infrastructure."*

---

## 2. Architecture & Deployment Matrix

We employ a "Right Tool for the Job" strategy for deployment:

| Ecosystem | Tool | Package | Strategy |
| :--- | :--- | :--- | :--- |
| **Node.js / Bun** | **SDK** | `@gravito/quasar` | **In-App Integration**. Directly imports into the app. Captures Event Loop, Heap, and Queues. |
| **Legacy / Polyglot** | **Agent** | `gravito/quasar-agent` | **Sidecar / Daemon**. Standalone Go binary. Captures OS-level metrics and external Queue states via Redis/API. |

### 🚀 Deployment Methods (Zero Friction)
1.  **NPM**: `npm install @gravito/quasar` (For Node developers)
2.  **Docker**: `image: gravito/quasar-agent:latest` (For Container/K8s/Laravel Sail)
3.  **Shell**: `curl -sL get.gravito.dev/quasar | bash` (For Bare Metal/VM)

---

## 3. Data Protocol (The Quasar Schema)

All agents/SDKs report to Redis using this unified schema.

**Namespace**: `gravito:quasar:`

### A. Heartbeat (Infrastructure)
*   **Key**: `gravito:quasar:node:{service_name}:{node_id}`
*   **TTL**: 30 seconds
*   **Metrics Philosophy**: Report **BOTH** Process and System metrics to isolate resource usage.
    *   `process`: metrics for the specific service (RAM usage, CPU time).
    *   `system`: metrics for the host OS (Load avg, Total RAM).

### B. Queues (Workload)
*   **Key**: `gravito:quasar:queues:{service_name}`
*   **TTL**: 30 seconds
*   **Purpose**: Snapshots of queue depths from various drivers.
    *   Gravito Stream (Native)
    *   Laravel Horizon (Redis)
    *   BullMQ (Redis)
    *   AWS SQS (API)

### C. Insights (Performance)
*   **Key**: `gravito:quasar:slow:{service_name}` (Stream)
*   **Purpose**: Log requests or jobs that exceed performance thresholds.

---

## 4. Execution Roadmap

### Phase 1: Foundation & Application Monitoring (Pulse Node)
**Goal**: Establish the basic dashboard and Node.js SDK for monitoring application health (CPU/RAM).

- [x] **Define Schema**: Update `PULSE_SPEC.md` with new Redis key patterns (`gravito:quasar:node:*`) and payload structure.
- [x] **SDK Update**: Refactor `@gravito/quasar` (formerly pulse-node) to support:
    - [x] Automatic runtime detection (Node, Bun, Deno).
    - [x] System/Process split metrics.
    - [x] Correct Redis namespacing.
- [x] **Server Update**: Update Zenith's `PulseService` to scan new key patterns.
- [x] **UI Overhaul**: Redesign `PulsePage` in Zenith:
    - [x] Implement "Card" layout for nodes.
    - [x] Rich metrics visualization (CPU/RAM split bars).
    - [x] Add brand icons for runtimes (Node, Bun, Deno, PHP, Go, Python).
    - [x] **Layout Optimization**: Compact Grid for Service Groups (Full width for single nodes).

### Phase 2: Application Insights (Queues)
**Goal**: Monitor queue health (Redis/Queue count, throughput) without needing full Queue Inspector.om other systems (e.g., Laravel).
*   [ ] **Protocol**: Define `QueueSnapshot` interface in `packages/quasar`.
*   [ ] **SDK**: Add `.monitorQueues()` capabilities to Quasar SDK.
*   [ ] **UI**: Update `PulsePage` (or `QueuesPage`) to visualize these external queues.

### Phase 3: The Go Agent (Sidecar) - **Future** 🔮
*   **Goal**: Monitor non-Node environments (Laravel, Python).
*   [ ] Create `gravito-framework/quasar` repo.
*   [ ] Develop Go Agent (utilizing `gopsutil`).
*   [ ] Implement "Laravel Adapter" inside the Go Agent (reading Redis/DB).
*   [ ] Docker & Binary Release pipeline.

---

## 5. Security & Access
*   **Auth**: Agents authenticate via a shared secret (`QUASAR_TOKEN`) if writing to a remote Redis.
*   **Isolation**: Process metrics only report what they have access to. System metrics require readable `/proc` (in Docker).
