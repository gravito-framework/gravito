/**
 * @gravito/monitor
 *
 * Observability module for Gravito
 * - Health Checks (Kubernetes probes)
 * - Metrics (Prometheus format)
 * - Tracing (OpenTelemetry OTLP)
 */

// Configuration
export {
  defineMonitorConfig,
  type HealthCheckFn,
  type HealthCheckResult,
  type HealthConfig,
  type MetricOptions,
  type MetricsConfig,
  type MonitorConfig,
  type TracingConfig,
} from './config'
// Health
export {
  createDatabaseCheck,
  createDiskCheck,
  createHttpCheck,
  createMemoryCheck,
  createRedisCheck,
  HealthController,
  HealthRegistry,
  type HealthReport,
} from './health'
// Main plugin
export { MonitorOrbit, type MonitorService } from './MonitorOrbit'

// Metrics
export {
  Counter,
  createHttpMetricsMiddleware,
  Gauge,
  Histogram,
  MetricsController,
  MetricsRegistry,
} from './metrics'

// Tracing
export {
  createTracingMiddleware,
  type Span,
  type SpanContext,
  type SpanEvent,
  TracingManager,
} from './tracing'
