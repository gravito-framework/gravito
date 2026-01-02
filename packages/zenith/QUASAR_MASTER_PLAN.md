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

### Phase 1: SDK Foundation (Node/Bun) - **In Progress** 🟡
*   **Goal**: Establish the SDK and integrate it into Zenith (Dogfooding).
*   [x] Create `@gravito/quasar` package.
*   [x] Implement `QuasarAgent` (Basic Heartbeat).
*   [x] Switch Protocol to SSE.
*   [ ] **Refinement**: Update Probe to split `system_cpu` vs `process_cpu`.
*   [ ] **Refinement**: Migrate Redis keys to `gravito:quasar:*` namespace.

### Phase 2: Application Insights (Queues) - **Next** 📅
*   **Goal**: Let Zenith monitor queues from other systems (e.g., Laravel).
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
