
# 🏗️ Gravito Flux Console Architecture

> The official, standalone visualization and management console for Gravito Flux & Stream.

## 1. Project Manifesto

- **Dogfooding First**: Uses `@gravito/photon` for HTTP serving and `@gravito/stream` for queue interaction.
- **Zero-Config**: Should work out-of-the-box via `npx` with minimal arguments.
- **Stateless**: The console itself holds no long-term state; Redis is the source of truth.
- **Micro-Frontend Ready**: Built with React, matching the Gravito Admin ecosystem, but capable of running standalone.

## 2. System Architecture

```mermaid
graph TD
    CLI[CLI Entry (bin)] --> Boot[Bootstrapper]
    Boot -->|Init| Server[Photon Server (Node/Bun)]
    
    subgraph "Backend Layer"
        Server -->|Serve| API[Management API]
        Server -->|Serve| Static[Frontend Assets]
        
        API -->|Command| QM[QueueManager (@gravito/stream)]
        QM -->|Protocol| Redis[(Redis)]
    end
    
    subgraph "Frontend Layer (React/Vite)"
        UI[Dashboard UI] -->|Fetch| API
    end
```

## 3. Technical Stack

### Backend
- **Runtime**: Bun / Node.js (Compat)
- **Framework**: **`@gravito/photon`** (Hono wrapper)
- **Data Access**: **`@gravito/stream`** (Directly uses QueueDrivers)
- **Persistence**: **`MySQLPersistence`** / **`SQLitePersistence`** for long-term auditing.

### Frontend
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: TailwindCSS (keeping consistent with `admin-shell`)
- **State Management**: React Query (TanStack Query) for real-time polling.

## 4. Key Features (Phase 1 MVP)

### A. Dashboard
- **System Overview**: Connection status, Driver type (Redis/Rabbit/Kafka).
- **Throughput Metrics**: Jobs processed per second (calculated window).

### B. Queue Management
- **List Queues**: Show all active queues with counts (Waiting, Active, Failed).
- **Inspect Queue**: View jobs in a paginated list.
- **Job Detail**: View JSON payload and stack trace.

### C. Actions
- **Retry Job**: Move job from `failed` to `waiting`.
- **Delete Job**: Remove job permanently.

### D. Persistence & Auditing
- **Job Archive**: Completed and Failed jobs move to SQL storage.
- **Hybrid Search**: Query both Redis (Live) and SQL (Archive) simultaneously.
- **Retention Management**: Configurable auto-cleanup for historical data.

### E. Alerting System
- **Real-time Checks**: Monitoring for failure spikes and worker loss.
- **Notifications**: Slack integration via Webhooks.
- **Cool-down Logic**: Prevents duplicated alerts for the same event.

## 5. Deployment Strategy

The package is published as a standard NPM package. It contains a `bin` entry point.

### Usage Scenarios
1.  **Local Ad-hoc**: `npx @gravito/flux-console start --url redis://...`
2.  **Project Integration**: Add to `package.json` scripts.
3.  **Docker**: Official image wrapping the CLI.

## 6. Development Workflow

Since this is a monolithic package (Backend + Frontend):
- `npm run dev` should start:
    1.  Vite Dev Server (Frontend)
    2.  Photon Watch Mode (Backend)
- Backend should proxy `/` requests to Vite during development.
