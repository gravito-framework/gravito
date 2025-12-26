# Mesh & Observability Verification

This example validates the Gravito Distributed Suite (`beam`, `monitor`, `flare`) in a microservices scenario.

## Scenario
**Distributed Health Monitoring & RPC**
- **Service B (Provider)**: Exposes a `/calculate` RPC endpoint and built-in observability endpoints (`/health`, `/metrics`) via `MonitorOrbit`.
- **Service A (Consumer)**: 
    - Uses `beam` for type-safe RPC communication with Service B.
    - Monitors Service B health in the background.
    - Uses `flare` to send alerts (logged to `storage/alerts.log`) if Service B becomes unhealthy.

## Running
```bash
bun run verify.ts
```

## Architecture
- **RPC**: `beam` allows Service A to call Service B's methods with full IntelliSense and type safety without code generation.
- **Monitoring**: `MonitorOrbit` provides standardized `/health` (Kubernetes-compatible) and `/metrics` (Prometheus-compatible) endpoints.
- **Notifications**: `flare` handles multi-channel delivery. In this example, a custom `FileAlertChannel` is registered to simulate notification delivery.
