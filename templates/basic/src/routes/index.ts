import type { PlanetCore } from 'gravito-core';
import { ApiController } from '../controllers/ApiController';
import { HomeController } from '../controllers/HomeController';

/**
 * Register all application routes
 *
 * This file only defines URL → Controller mapping.
 * All request handling logic is in the controllers.
 */
export function registerRoutes(core: PlanetCore): void {
  const home = new HomeController(core);
  const api = new ApiController(core);

  // ─────────────────────────────────────────────
  // Pages
  // ─────────────────────────────────────────────
  core.app.get('/', home.index);

  // ─────────────────────────────────────────────
  // API
  // ─────────────────────────────────────────────
  core.app.get('/api/health', api.health);
  core.app.get('/api/config', api.config);
  core.app.get('/api/stats', api.stats);
}
