/**
 * @fileoverview PlanetCore - The Heart of Gravito Framework
 *
 * The micro-kernel that orchestrates the entire Galaxy Architecture.
 * Manages HTTP routing, middleware, error handling, and orbit integration.
 *
 * @module gravito-core
 * @since 1.0.0
 */
import type { HttpAdapter } from './adapters/types';
import { ConfigManager } from './ConfigManager';
import { Container } from './Container';
import { EventManager } from './EventManager';
import { type RegisterGlobalErrorHandlersOptions } from './GlobalErrorHandlers';
import { HookManager } from './HookManager';
import { fail } from './helpers/response';
import type { ContentfulStatusCode, GravitoContext } from './http/types';
import { type Logger } from './Logger';
import type { ServiceProvider } from './ServiceProvider';
/**
 * CacheService interface for orbit-injected cache
 * Orbits implementing cache should conform to this interface
 */
export interface CacheService {
    get<T = unknown>(key: string): Promise<T | null>;
    set(key: string, value: unknown, ttl?: number): Promise<void>;
    delete(key: string): Promise<void>;
    clear(): Promise<void>;
    remember<T>(key: string, ttl: number, callback: () => Promise<T>): Promise<T>;
}
export interface ViewService {
    render(view: string, data?: Record<string, unknown>, options?: Record<string, unknown>): string;
}
export type ErrorHandlerContext = {
    core: PlanetCore;
    c: GravitoContext;
    error: unknown;
    isProduction: boolean;
    accept: string;
    wantsHtml: boolean;
    status: ContentfulStatusCode;
    payload: ReturnType<typeof fail>;
    logLevel?: 'error' | 'warn' | 'info' | 'none';
    logMessage?: string;
    html?: {
        templates: string[];
        data: Record<string, unknown>;
    };
};
export interface GravitoOrbit {
    install(core: PlanetCore): void | Promise<void>;
}
export type GravitoConfig = {
    logger?: Logger;
    config?: Record<string, unknown>;
    orbits?: (new () => GravitoOrbit)[] | GravitoOrbit[];
    /**
     * HTTP Adapter to use. Defaults to HonoAdapter.
     * @since 2.0.0
     */
    adapter?: HttpAdapter;
};
import { Router } from './Router';
import { Encrypter } from './security/Encrypter';
import { BunHasher } from './security/Hasher';
export declare class PlanetCore {
    /**
     * The HTTP adapter used by this core instance.
     * @since 2.0.0
     */
    private _adapter;
    /**
     * Access the underlying Hono app instance.
     * @deprecated Use adapter methods for new code. This property is kept for backward compatibility.
     */
    get app(): unknown;
    /**
     * Get the HTTP adapter instance.
     * @since 2.0.0
     */
    get adapter(): HttpAdapter;
    logger: Logger;
    config: ConfigManager;
    hooks: HookManager;
    events: EventManager;
    router: Router;
    container: Container;
    /** @deprecated Use core.container instead */
    services: Map<string, unknown>;
    encrypter?: Encrypter;
    hasher: BunHasher;
    private providers;
    /**
     * Register a service provider.
     *
     * @param provider - The ServiceProvider instance to register.
     * @returns The PlanetCore instance for chaining.
     *
     * @example
     * ```typescript
     * core.register(new DatabaseServiceProvider());
     * ```
     */
    register(provider: ServiceProvider): this;
    /**
     * Bootstrap the application by registering and booting providers.
     *
     * This method must be called before the application starts handling requests.
     * It calls `register()` on all providers first, then `boot()` on all providers.
     *
     * @returns Promise that resolves when bootstrapping is complete.
     */
    bootstrap(): Promise<void>;
    constructor(options?: {
        logger?: Logger;
        config?: Record<string, unknown>;
        adapter?: HttpAdapter;
    });
    /**
     * Programmatically register an infrastructure module (Orbit).
     * @since 2.0.0
     *
     * @param orbit - The orbit class or instance to register.
     * @returns The PlanetCore instance for chaining.
     *
     * @example
     * ```typescript
     * await core.orbit(OrbitCache);
     * ```
     */
    orbit(orbit: GravitoOrbit | (new () => GravitoOrbit)): Promise<this>;
    /**
     * Programmatically register a feature module (Satellite).
     * Alias for register() with provider support.
     * @since 2.0.0
     *
     * @param satellite - The provider or setup function.
     * @returns The PlanetCore instance for chaining.
     *
     * @example
     * ```typescript
     * await core.use(new AuthProvider());
     * ```
     */
    use(satellite: ServiceProvider | ((core: PlanetCore) => void | Promise<void>)): Promise<this>;
    registerGlobalErrorHandlers(options?: Omit<RegisterGlobalErrorHandlersOptions, 'core'>): () => void;
    /**
     * Boot the application with a configuration object (IoC style default entry)
     *
     * @param config - The Gravito configuration object.
     * @returns A Promise resolving to the booted PlanetCore instance.
     *
     * @example
     * ```typescript
     * const core = await PlanetCore.boot(config);
     * ```
     */
    static boot(config: GravitoConfig): Promise<PlanetCore>;
    /**
     * Mount an Orbit (a Hono app) to a path.
     *
     * @param path - The URL path to mount the orbit at.
     * @param orbitApp - The Hono application instance.
     */
    mountOrbit(path: string, orbitApp: unknown): void;
    /**
     * Start the core (Liftoff).
     *
     * Returns a config object for `Bun.serve`.
     *
     * @param port - Optional port number (defaults to config or 3000).
     * @returns An object compatible with Bun.serve({ ... }).
     *
     * @example
     * ```typescript
     * export default core.liftoff(3000);
     * ```
     */
    liftoff(port?: number): {
        port: number;
        fetch: (request: Request, server?: unknown) => Response | Promise<Response>;
        core: PlanetCore;
    };
}
//# sourceMappingURL=PlanetCore.d.ts.map