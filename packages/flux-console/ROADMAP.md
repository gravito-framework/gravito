# Flux Console Roadmap

This document outlines the future development plan for Flux Console, moving from a basic monitoring tool to a comprehensive enterprise-grade job orchestration platform.

## 🚀 High Priority (Immediate Next Steps)

### 1. Docker & Cloud-Native Deployment (P0)
**Goal**: Enable "One-Click Deployment" for any environment (local, EC2, K8s).
- **Current Blocker**: Local workspace dependencies (`workspace:*`) cause build failures in standard Docker contexts.
- **Tasks**:
- [x] Fix `Dockerfile` dependency resolution (via multi-stage builds).
- [x] Create `docker-compose.yml` for a full stack setup (Console + Redis + Demo Worker).
- [x] Implementation of Scheduled Jobs (Cron) Management.

### 2. History Persistence (SQL Archive) (Completed ✅)
**Goal**: Store job history permanently for auditing and long-term analysis.
- [x] Implement a `PersistenceAdapter` in `@gravito/stream`.
- [x] Automatically archive completed/failed jobs to a SQL database.
- [x] **Zero-Config (SQLite)**: Integrated support for local testing.
- [x] **Fallback Query**: Integrated archive search into UI and command palette.

## ✨ Feature Enhancements (Mid-Term)

### 3. Alerting & Notifications (Completed ✅)
**Goal**: Proactive issue notification system.
- [x] **AlertService**: Lightweight rules for failure spikes, backlog, and worker loss.
- [x] **Cooldown Mechanism**: Prevents alerting storms.
- [x] **Slack Integration**: Webhook support with test notification UI.
- [x] **Real-time Monitoring**: Integrated directly into server metrics loop.

### 4. Scheduled Jobs (Cron) Management (Completed ✅)
**Goal**: UI-based management for recurring tasks.
- [x] Dashboard to view all registered Cron jobs.
- [x] Ability to "Trigger Now" manually.
- [x] Ability to Pause/Resume (Delete/Register) specific Cron schedules.
- [x] Real-time ticking via the Console server.

### 4. Batch Operations (Completed ✅)
**Goal**: Bulk management actions.
- **Problem**: Can only retry/delete one job or "all" jobs. Hard to handle "the 50 jobs that failed due to the bug yesterday".
- **Tasks**:
    - [x] Multi-select checkboxes in job lists.
    - [x] Bulk Retry / Bulk Delete.
    - [x] Select All Matching Query (Delete/Retry ALL jobs of a type).
    - [x] Confirmation dialogs with loading states.
    - [x] Keyboard shortcuts (Ctrl+A, Escape).
    - [x] Visual feedback and total count display.

## 🔮 Enterprise Features (Long-Term)

### 6. Role-Based Access Control (RBAC)
**Goal**: Granular permission management for teams.
- **Problem**: Single password for everyone. Risky for junior devs to have "Delete Queue" power.
- **Features**:
    - Roles: `Viewer` (Read-only), `Operator` (Retry/Pause), `Admin` (Delete/Purge).
    - User Management system (potentially integrated with OAuth/SSO).

### 7. Multi-Cluster Management
**Goal**: Centralized control pane for multiple environments.
- **Problem**: Need to open 3 different tabs for Dev, Staging, and Prop.
- **Features**:
    - Connection Switcher in the UI header.
    - Unified view of multiple Redis instances.

### 8. Enhanced Search (Indexer)
**Goal**: Full-text search on Job Payloads.
- **Problem**: Can only search by Job ID. Cannot search by "email: user@example.com".
- **Solution**: Implement a lightweight search index (RedisSearch or external engine) to index payloads.
