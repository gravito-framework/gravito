import type { PlanetCore } from 'gravito-core';
import type { Context, Next } from 'hono';

export interface OrbitDBOptions<TSchema extends Record<string, unknown> = Record<string, unknown>> {
  // biome-ignore lint/suspicious/noExplicitAny: generic db instance
  db: any; // We allow any drizzle instance here (postgres, mysql, etc)
  schema?: TSchema;
  exposeAs?: string; // Key to expose in core (e.g., 'db'), default 'db'
}

/**
 * Standard Database Orbit using Drizzle ORM
 *
 * Provides:
 * 1. Global db access via `core.hooks` or context injection (?)
 *    - Actually, we can attach it to a global singleton or just use the hook system to retrieve it.
 *    - Better yet, we can attach it to the core instance if we extend the core interface, but that is hard dynamically.
 *    - We will register a request context hook to inject 'db' into context?
 *
 * 2. Hooks for query auditing
 */
export default function orbitDB<TSchema extends Record<string, unknown>>(
  core: PlanetCore,
  options: OrbitDBOptions<TSchema>
) {
  const { db, exposeAs = 'db' } = options;

  core.logger.info(`[OrbitDB] Initializing database integration (Exposed as: ${exposeAs})`);

  // 1. Action: Database Connected
  core.hooks.doAction('db:connected', { db });

  // 2. Middleware injection (Satellite style)
  // Inject DB into every request context variable if using Hono
  core.app.use('*', async (c: Context, next: Next) => {
    c.set(exposeAs, db);
    await next();
  });

  // 3. Helper to generic query execution (Optional wrapper could be provided, but usually we use db directly)
  // For now, we mainly provide the context injection and connection hooking.

  return {
    db,
  };
}
