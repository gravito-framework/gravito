# Gravito Pulse Implementation Plan
**Version**: 1.0.0
**Status**: Draft
**Target**: Zenith v2.0

This document outlines the step-by-step implementation plan for the **System Pulse (Lightweight APM)** module in Gravito Zenith.

---

## 🏗 Architecture Specifications

### 1. Redis Schema (The "Source of Truth")

| Key Pattern | Type | TTL | Description |
| :--- | :--- | :--- | :--- |
| `pulse:server:{app}:{id}` | `String` (JSON) | 30s | **Heartbeat**. Contains realtime CPU/RAM/Disk stats. |
| `pulse:slow:{app}` | `Stream` | MaxLen 1000 | **Slow Logs**. Validated heavy requests/jobs. |
| `pulse:errors:{app}` | `ZSet` | 1hr | **Exceptions**. Scored by timestamp. |

### 2. Gravito Pulse Protocol (GPP)
Defined in `packages/pulse-protocol`. Shared by all SDKs.

```typescript
interface PulseHeartbeat {
  timestamp: number;
  system: {
    hostname: string;
    platform: string;
    cpu_usage: number; // Percentage (0-100)
    memory_total: number; // Bytes
    memory_free: number; // Bytes
    load_avg: number[]; // [1m, 5m, 15m]
  };
  process: {
    pid: number;
    uptime: number; // Seconds
    cpu_usage: number; // Percentage of process
    memory_rss: number; // Bytes
    memory_heap: number; // Bytes
  };
  meta: {
    app_name: string;
    environment: string;
    runtime: 'node' | 'php' | 'python' | 'go';
    version: string;
  };
}
```

---

## 📅 Implementation Phases

### Phase 1: Foundation (Protocol & Node SDK)
**Goal**: Create the shared types and the first recorder for Node.js.

- [ ] **Task 1.1: Create `packages/pulse-protocol`**
    - Initialize a new workspace package.
    - Define TypeScript interfaces for Heartbeat, SlowEntry, and ErrorEntry.
    - Export Redis key constants (e.g., `PULSE_KEY_PREFIX = 'pulse'`).
    - Build script setup (tsup).

- [ ] **Task 1.2: Create `packages/pulse-node`**
    - Initialize a new workspace package.
    - Dependencies: `ioredis`, `systeminformation` (or `os` + `pidusage`), `@gravito/pulse-protocol`.
    - Implement `PulseRecorder` class:
        - `start()`: Starts the 5s interval loop.
        - `private collect()`: Gathers system stats.
        - `private report()`: Writes JSON to Redis with 30s TTL.

### Phase 2: Zenith Integration (Backend)
**Goal**: Enable Zenith to consume and stream this data.

- [ ] **Task 2.1: Add Monitor Service**
    - Create `src/server/services/MonitorService.ts` in Zenith.
    - Implement `scanHeartbeats()`: Uses `SCAN` to find all `pulse:server:*` keys.
    - Implement `getAggregateMetrics()`: Fetches and groups heartbeats by `app_name`.

- [ ] **Task 2.2: SSE Stream Update**
    - Update `src/server/routes/sse.ts` (or equivalent).
    - Include `system_pulse` event type in the existing SSE loop.
    - Stream aggregated metrics every 2-5 seconds to connected clients.

### Phase 3: Frontend Dashboard (UI)
**Goal**: Visualize the data in a "Laravel Pulse" style grid.

- [ ] **Task 3.1: Dashboard Layout**
    - Create `src/client/pages/PulsePage.tsx`.
    - Implement a CSS Grid / Masonry layout container.

- [ ] **Task 3.2: Metric Cards (Widgets)**
    - Component: `ServerCard`: Shows CPU/RAM guages and Disk bars.
    - Component: `ProcessList`: Shows active worker processes.
    - Component: `AppHealthCard`: Shows aggregate health score.

- [ ] **Task 3.3: Integration**
    - Connect `PulsePage` to the SSE context.
    - Handle "Server Lost" state (grey out cards if heartbeat stops).

### Phase 4: Advanced Monitoring (Slow & Errors)
**Goal**: Catch the "bad" requests.

- [ ] **Task 4.1: Slow Request Interceptor (Node.js)**
    - Add `httpMiddleware` to `pulse-node`.
    - Tracks request start/end time.
    - If > threshold (default 1s), XADD to `pulse:slow:{app}`.

- [ ] **Task 4.2: Slow Log UI**
    - Create `SlowRequestWidget` in Zenith.
    - Fetch latest items from the Redis Stream.

---

## ⚡ Development Guidelines
1.  **Zero-Crash Policy**: The Recorder MUST NEVER crash the host application. Wrap everything in `try/catch`. If Redis is down, fail silently.
2.  **Performance First**: Collection must take < 10ms. Use non-blocking OS calls.
3.  **Type Safety**: Strict adherence to `@gravito/pulse-protocol`.
