# Gravito Zenith Evolution Blueprint
**Target**: Zenith v2.0 - The Universal Application Control Plane
**Core Philosophy**: Lightweight, Redis-Native, Language-Agnostic.

## 🧭 Strategic Vision

We aim to evolve Zenith from a **Queue Manager** into a **Lightweight Application Control Plane**. We will absorb the best features from industry leaders (Laravel Pulse, Sidekiq, BullMQ) while strictly avoiding their architectural pitfalls (heavy deps, SQL locks, language coupling).

---

## 📅 Roadmap Structure

### Phase 1: Deep Visibility (Queue Insights)
**Focus**: Enhance the depth of information for the current Queue System.
**Benchmarks**: Sidekiq, BullMQ.

#### 1.1 Worker "X-Ray" Vision (The "Busy" State)
-   **Concept**: Instead of just showing "Busy", show *what* the worker is doing.
-   **Implementation**: Update Heartbeat Protocol to include `currentJobId` and `jobName`.
-   **UI**: Workers table shows "Processing: Order #1024 (SendEmail)".
-   **Benefit**: Instantly identify which job is hogging a worker.
-   **Difference**: Unlike Sidekiq which uses expensive extensive locking, we use ephemeral keys.

#### 1.2 Enhanced Payload Inspector
-   **Concept**: Developer-friendly data inspection.
-   **Implementation**:
    -   Syntax-highlighted JSON viewer with folding.
    -   "Copy as cURL" or "Copy to Clipboard" actions.
    -   Display stack traces with click-to-open (if local) potential.
-   **UX Rule**: Always lazy-load heavy payloads. Never fetch them in the list view.

#### 1.3 Timeline Visualization (Gantt-lite)
-   **Concept**: Visualize concurrency.
-   **Implementation**: A canvas-based timeline showing job execution durations overlapping in time.
-   **Benefit**: Spot resource contention or gaps in processing.

---

## Phase 2: System Pulse (Resource Monitoring)
**Focus**: Lightweight APM (Application Performance Monitoring).
**Benchmarks**: Laravel Pulse, PM2.

#### 2.1 Gravito Pulse Protocol (GPP)
-   **Concept**: A standardized JSON structure for services to report health.
-   **Structure**: `pulse:{service}:{id}` (TTL 30s).
-   **Metrics**: CPU%, RAM (RSS/Heap), Disk Usage, Uptime, Event Loop Lag.
-   **Avoidance**: Do NOT store historical time-series data in SQL. Use Redis Lists/Streams with aggressive trimming (e.g., keep last 1 hour).

#### 2.2 Grid Dashboard
-   **Concept**: Customizable "Mission Control" view.
-   **UI**: Drag-and-drop grid system.
-   **Widgets**:
    -   Host Health (CPU/RAM guages).
    -   Queue Backlog (Sparklines).
    -   Exception Rate (Counter).
    -   Slowest Routes (List).

#### 2.3 Cross-Language Recorders
-   **Goal**: Provide simple SDKs.
    -   `@gravito/recorder-node`: For Express/Hono/Nest.
    -   `@gravito/recorder-php`: For Laravel/Symfony.
    -   `@gravito/recorder-python`: For Django/FastAPI.

---

## Phase 3: Intelligent Operations (Proactive Ops)
**Focus**: Alerting and Anomaly Detection.
**Benchmarks**: New Relic (Lite), Oban.

#### 3.1 Outlier Detection (The "Slow" & "Error" Trap)
-   **Concept**: Only capture interesting data.
-   **Logic**:
    -   If `duration > threshold`: Push to `pulse:slow_jobs`.
    -   If `status >= 500`: Push to `pulse:exceptions`.
-   **Benefit**: Zero overhead for successful, fast requests.

#### 3.2 Smart Alerting Engine
-   **Concept**: "Don't spam me."
-   **Features**:
    -   **Thresholds**: "CPU > 90% for 5 minutes".
    -   **Cooldown**: "Alert once per hour per rule".
    -   **Channels**: Slack, Discord, Email, Webhook.

---

## 🎨 UI/UX Unification Strategy

To prevent "Feature Bloat" (UI Clutter), we will enforce strict design rules:

### 1. Navigation Hierarchy
Refactor Sidebar into logical groups:
-   **Dashboards** (Overview, System Pulse)
-   **Queues** (Active, Waiting, Delayed, Failed)
-   **Infrastructure** (Workers, Databases, Redis)
-   **Settings** (Alerts, API Keys)

### 2. Contextual Density
-   **List View**: Minimal info (ID, Name, Status, Time).
-   **Detail Panel**: Slide-over panel for deep inspection (Payloads, Stack Traces, Logs).
-   **Avoidance**: Don't try to cram everything into the table rows.

### 3. Unified Filters
-   Create a shared "Filter Bar" component (Date Range, Status, Queue Name) that works consistently across Logs, Jobs, and Pulse views.

---

## ✅ Implementation Checklist (Next Steps)

1.  **[ ] Protocol Definition**: Document `GPP` (Gravito Pulse Protocol).
2.  **[ ] Backend Core**: Implement `SystemMonitor` service in Zenith.
3.  **[ ] Frontend Core**: Create the `GridDashboard` component layout.
4.  **[ ] Feature**: Implement `Worker X-Ray` (easiest win from Phase 1).
