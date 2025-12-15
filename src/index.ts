/**
 * gravito-core
 *
 * The core micro-kernel for the Galaxy Architecture.
 */

// Export version from package.json
import packageJson from '../package.json';

export const VERSION = packageJson.version;

export type { ActionCallback, FilterCallback } from './HookManager';
export { HookManager } from './HookManager';
// Core Exports
export { PlanetCore } from './PlanetCore';
