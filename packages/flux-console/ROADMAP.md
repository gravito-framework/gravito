# Flux Console Roadmap

This document outlines the future development plan for Flux Console, moving from a basic monitoring tool to a comprehensive enterprise-grade job orchestration platform.

## 🚀 High Priority (Immediate Next Steps)

### 1. Docker & Cloud-Native Deployment (P0)
**Goal**: Enable "One-Click Deployment" for any environment (local, EC2, K8s).
- **Current Blocker**: Local workspace dependencies (`workspace:*`) cause build failures in standard Docker contexts.
- **Tasks**:
- [x] Fix `Dockerfile` dependency resolution (via multi-stage builds).
- [x] Create `docker-compose.yml` for a full stack setup (Console + Redis + Demo Worker).
- [ ] (Optional) Create a Helm Chart for K8s deployment.

### 2. History Persistence (SQL Archive) (P1)
**Goal**: Store job history permanently for auditing and long-term analysis.
- **Problem**: Redis data is ephemeral and sets a TTL. History is lost after a few days.
- **Solution**: "Framework-Level Auto-Persistence".
    - [x] Implement a `PersistenceAdapter` in `@gravito/stream`.
    - [x] Automatically archive completed/failed jobs to a SQL database (MySQL/PostgreSQL via Atlas).
    - [x] **Fallback Query**: If Redis query returns null, automatically fallback to query the SQL archive.
- **Value**: Allows developers to trace "What happened to that order 3 months ago?" without writing custom logging code.

## ✨ Feature Enhancements (Mid-Term)

### 3. Alerting & Notifications (P2)
**Goal**: Proactive issue notification system.
- **Problem**: Operations team must stare at the dashboard to spot issues.
- **Features**:
    - Configurable Rules: "Alert if `failed_rate` > 10%" or "Alert if `queue_length` > 1000".
    - Channels: Slack Webhook, Email, Discord, PagerDuty.
    - Silence/Ack mechanism.

### 4. Scheduled Jobs (Cron) Management
**Goal**: UI-based management for recurring tasks.
- **Problem**: Currently, recurring jobs are defined in code and invisible in the UI until they trigger.
- **Features**:
    - Dashboard to view all registered Cron jobs.
    - Ability to "Trigger Now" manually.
    - Ability to Pause/Resume specific Cron schedules.

### 5. Batch Operations
**Goal**: Bulk management actions.
- **Problem**: Can only retry/delete one job or "all" jobs. Hard to handle "the 50 jobs that failed due to the bug yesterday".
- **Features**:
    - Multi-select checkboxes in job lists.
    - "Select Visible" or "Select All Matching Query".
    - Bulk Retry / Bulk Delete / Bulk Promote.

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
