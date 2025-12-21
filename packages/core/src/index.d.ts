/**
 * gravito-core
 *
 * The core micro-kernel for the Galaxy Architecture.
 *
 * @packageDocumentation
 */
import type { GravitoConfig } from './PlanetCore';
export declare const VERSION: string;
export { createHonoAdapter, HonoAdapter, HonoContextWrapper, HonoRequestWrapper, } from './adapters/HonoAdapter';
export type { AdapterConfig, AdapterFactory, HttpAdapter, RouteDefinition } from './adapters/types';
export { isHttpAdapter } from './adapters/types';
export type { ContentfulStatusCode, GravitoContext, GravitoErrorHandler, GravitoHandler, GravitoMiddleware, GravitoNext, GravitoNotFoundHandler, GravitoRequest, GravitoVariables, HttpMethod, StatusCode, ValidationTarget, } from './http/types';
export { ConfigManager } from './ConfigManager';
export { Container, type Factory } from './Container';
export { EventManager } from './EventManager';
export * from './exceptions';
export { type GlobalErrorHandlersMode, type GlobalProcessErrorHandlerContext, type GlobalProcessErrorKind, type RegisterGlobalErrorHandlersOptions, registerGlobalErrorHandlers, } from './GlobalErrorHandlers';
export type { ActionCallback, FilterCallback } from './HookManager';
export { HookManager } from './HookManager';
export * from './helpers';
export { CookieJar, type CookieOptions } from './http/CookieJar';
export { ThrottleRequests } from './http/middleware/ThrottleRequests';
export type { Listener, ShouldQueue } from './Listener';
export type { Logger } from './Logger';
export { ConsoleLogger } from './Logger';
export { type CacheService, type ErrorHandlerContext, type GravitoConfig, type GravitoOrbit, PlanetCore, type ViewService, } from './PlanetCore';
export { Route } from './Route';
export { type ControllerClass, type FormRequestClass, type FormRequestLike, type RouteHandler, type RouteOptions, Router, } from './Router';
export { ServiceProvider } from './ServiceProvider';
export { Encrypter, type EncrypterOptions } from './security/Encrypter';
export type { Channel, ShouldBroadcast } from './types/events';
export { Event } from './types/events';
/**
 * Configure your Gravito application
 *
 * @example
 * ```typescript
 * const config = defineConfig({
 *   config: {
 *     APP_NAME: 'My App',
 *     PORT: 3000,
 *   },
 *   orbits: [OrbitCache, OrbitSession],
 * })
 *
 * const core = await PlanetCore.boot(config)
 * ```
 */
export declare function defineConfig(config: GravitoConfig): GravitoConfig;
//# sourceMappingURL=index.d.ts.map