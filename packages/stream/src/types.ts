/**
 * Serialized job payload.
 */
export interface SerializedJob {
  /**
   * Unique job identifier.
   */
  id: string

  /**
   * Serializer type: `'json'` or `'class'`.
   */
  type: 'json' | 'class'

  /**
   * Serialized data.
   */
  data: string

  /**
   * Class name (only for `type === 'class'`).
   */
  className?: string

  /**
   * Created timestamp.
   */
  createdAt: number

  /**
   * Delay before execution (seconds).
   */
  delaySeconds?: number

  /**
   * Current attempt number.
   */
  attempts?: number

  /**
   * Maximum attempts.
   */
  maxAttempts?: number

  /**
   * Group ID for FIFO ordering.
   */
  groupId?: string
}

/**
 * Topic options (for Kafka, etc.).
 */
export interface TopicOptions {
  /**
   * Number of partitions.
   */
  partitions?: number

  /**
   * Replication factor.
   */
  replicationFactor?: number

  /**
   * Additional config.
   */
  config?: Record<string, string>
}

/**
 * Queue connection config.
 */
export interface QueueConnectionConfig {
  /**
   * Driver type.
   */
  driver: 'memory' | 'database' | 'redis' | 'kafka' | 'sqs' | 'rabbitmq' | 'nats'

  /**
   * Driver-specific config.
   */
  [key: string]: unknown
}

/**
 * Queue manager config.
 */
export interface QueueConfig {
  /**
   * Default connection name.
   */
  default?: string

  /**
   * Connection configs.
   */
  connections?: Record<string, QueueConnectionConfig>

  /**
   * Default serializer type.
   */
  defaultSerializer?: 'json' | 'class'
}

/**
 * Options when pushing a job.
 */
export interface JobPushOptions {
  /**
   * Group ID for FIFO ordering (e.g. userId).
   * If set, jobs with the same groupId will be processed strictly sequentially.
   */
  groupId?: string
}
