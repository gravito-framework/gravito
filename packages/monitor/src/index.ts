/**
 * @gravito/monitor
 * 
 * Observability module for Gravito
 * - Health Checks (Kubernetes probes)
 * - Metrics (Prometheus format)
 * - Tracing (OpenTelemetry OTLP)
 */

// Main plugin
export { MonitorOrbit, type MonitorService } from './MonitorOrbit'

// Configuration
export {
    type MonitorConfig,
    type HealthConfig,
    type MetricsConfig,
    type TracingConfig,
    type HealthCheckFn,
    type HealthCheckResult,
    type MetricOptions,
    defineMonitorConfig,
} from './config'

// Health
export {
    HealthRegistry,
    HealthController,
    createDatabaseCheck,
    createRedisCheck,
    createMemoryCheck,
    createHttpCheck,
    createDiskCheck,
    type HealthReport,
} from './health'

// Metrics
export {
    MetricsRegistry,
    MetricsController,
    Counter,
    Gauge,
    Histogram,
    createHttpMetricsMiddleware,
} from './metrics'

// Tracing
export {
    TracingManager,
    createTracingMiddleware,
    type Span,
    type SpanContext,
    type SpanEvent,
} from './tracing'
