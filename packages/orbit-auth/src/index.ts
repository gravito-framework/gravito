import type { PlanetCore } from 'gravito-core';
import type { Context, Next } from 'hono';
import { sign, verify } from 'hono/jwt';

export interface OrbitAuthOptions {
  secret: string;
  exposeAs?: string; // Default: 'auth'
}

export type AuthPayload = {
  sub: string;
  role?: string;
  [key: string]: unknown;
};

export default function orbitAuth(core: PlanetCore, options: OrbitAuthOptions) {
  const { secret, exposeAs = 'auth' } = options;
  const logger = core.logger;

  logger.info(`[OrbitAuth] Initializing Auth (Exposed as: ${exposeAs})`);

  // Helper Methods
  const authService = {
    async sign(payload: AuthPayload): Promise<string> {
      // Hook: Allow plugins to modify payload before signing
      const finalPayload = await core.hooks.applyFilters('auth:payload', payload);
      return sign(finalPayload, secret);
    },

    async verify(token: string): Promise<AuthPayload> {
      return (await verify(token, secret)) as AuthPayload;
    },
  };

  // Inject helper into context
  core.app.use('*', async (c: Context, next: Next) => {
    c.set(exposeAs, authService);
    await next();
  });

  // Action: Auth Initialized
  core.hooks.doAction('auth:init', authService);

  return authService;
}
