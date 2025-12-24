import type { GravitoHandler, GravitoMiddleware, HttpMethod } from './http/types';
import type { PlanetCore } from './PlanetCore';
import { Route } from './Route';
export type ControllerClass = new (core: PlanetCore) => Record<string, unknown>;
export type RouteHandler = GravitoHandler | [ControllerClass, string];
/**
 * Interface for FormRequest classes (from @gravito/impulse).
 * Used for duck-typing detection without hard dependency.
 */
export interface FormRequestLike {
    schema: unknown;
    source?: string;
    validate?(ctx: unknown): Promise<{
        success: boolean;
        data?: unknown;
        error?: unknown;
    }>;
}
/**
 * Type for FormRequest class constructor
 */
export type FormRequestClass = new () => FormRequestLike;
export interface RouteOptions {
    prefix?: string;
    domain?: string;
    middleware?: GravitoMiddleware[];
}
/**
 * RouteGroup
 * Helper class for chained route configuration (prefix, domain, etc.)
 */
export declare class RouteGroup {
    private router;
    private options;
    constructor(router: Router, options: RouteOptions);
    /**
     * Add a prefix to the current group
     */
    prefix(path: string): RouteGroup;
    /**
     * Add middleware to the current group.
     * Accepts individual handlers or arrays of handlers.
     */
    middleware(...handlers: (GravitoMiddleware | GravitoMiddleware[])[]): RouteGroup;
    /**
     * Define routes within this group
     */
    group(callback: (router: Router | RouteGroup) => void): void;
    get(path: string, handler: RouteHandler): Route;
    get(path: string, request: FormRequestClass, handler: RouteHandler): Route;
    post(path: string, handler: RouteHandler): Route;
    post(path: string, request: FormRequestClass, handler: RouteHandler): Route;
    put(path: string, handler: RouteHandler): Route;
    put(path: string, request: FormRequestClass, handler: RouteHandler): Route;
    delete(path: string, handler: RouteHandler): Route;
    delete(path: string, request: FormRequestClass, handler: RouteHandler): Route;
    patch(path: string, handler: RouteHandler): Route;
    patch(path: string, request: FormRequestClass, handler: RouteHandler): Route;
    resource(name: string, controller: ControllerClass, options?: ResourceOptions): void;
}
/**
 * Gravito Router
 *
 * Provides a Laravel-like fluent API for defining routes.
 * Supports:
 * - Controller-based routing: router.get('/', [HomeController, 'index'])
 * - Route groups with prefixes: router.prefix('/api').group(...)
 * - Domain-based routing: router.domain('api.app').group(...)
 * - Middleware chaining: router.middleware(auth).group(...)
 * - FormRequest validation: router.post('/users', StoreUserRequest, [UserController, 'store'])
 */
export declare class Router {
    private core;
    private controllers;
    private namedRoutes;
    private bindings;
    /**
     * Compile all registered routes into a flat array for caching or manifest generation.
     */
    compile(): {
        method: string;
        path: string;
        name?: string;
        domain?: string | undefined;
    }[];
    /**
     * Register a named route
     */
    registerName(name: string, method: string, path: string, options?: RouteOptions): void;
    /**
     * Generate a URL from a named route.
     */
    url(name: string, params?: Record<string, string | number>, query?: Record<string, string | number | boolean | null | undefined>): string;
    /**
     * Export named routes as a serializable manifest (for caching).
     */
    exportNamedRoutes(): Record<string, {
        method: string;
        path: string;
        domain?: string;
    }>;
    /**
     * Load named routes from a manifest (for caching).
     */
    loadNamedRoutes(manifest: Record<string, {
        method: string;
        path: string;
        domain?: string;
    }>): void;
    /**
     * Register a route model binding.
     */
    bind(param: string, resolver: (id: string) => Promise<unknown>): void;
    /**
     * Register a route model binding for a Model class.
     */
    model(param: string, modelClass: unknown): void;
    constructor(core: PlanetCore);
    /**
     * Start a route group with a prefix
     */
    prefix(path: string): RouteGroup;
    /**
     * Start a route group with a domain constraint
     */
    domain(host: string): RouteGroup;
    /**
     * Start a route group with middleware.
     * Accepts individual handlers or arrays of handlers.
     */
    middleware(...handlers: (GravitoMiddleware | GravitoMiddleware[])[]): RouteGroup;
    /**
     * Register a GET route.
     *
     * @param path - The URL path for the route.
     * @param handler - The handler function or controller method.
     * @returns The registered Route instance for chaining.
     *
     * @example
     * ```typescript
     * router.get('/users', [UserController, 'index']);
     * ```
     */
    get(path: string, handler: RouteHandler): Route;
    /**
     * Register a GET route with a FormRequest for validation.
     *
     * @param path - The URL path.
     * @param request - The FormRequest class for validation.
     * @param handler - The handler function or controller method.
     *
     * @example
     * ```typescript
     * router.get('/search', SearchRequest, [Controller, 'search']);
     * ```
     */
    get(path: string, request: FormRequestClass, handler: RouteHandler): Route;
    /**
     * Register a POST route.
     *
     * @param path - The URL path.
     * @param handler - The handler function or controller method.
     * @returns The registered Route instance.
     *
     * @example
     * ```typescript
     * router.post('/users', [UserController, 'store']);
     * ```
     */
    post(path: string, handler: RouteHandler): Route;
    /**
     * Register a POST route with validation.
     *
     * @param path - The URL path.
     * @param request - The FormRequest class.
     * @param handler - The handler.
     *
     * @example
     * ```typescript
     * router.post('/users', StoreUserRequest, [UserController, 'store']);
     * ```
     */
    post(path: string, request: FormRequestClass, handler: RouteHandler): Route;
    /**
     * Register a PUT route.
     *
     * @param path - The URL path.
     * @param handler - The handler function.
     * @returns The registered Route instance.
     */
    put(path: string, handler: RouteHandler): Route;
    put(path: string, request: FormRequestClass, handler: RouteHandler): Route;
    /**
     * Register a DELETE route.
     *
     * @param path - The URL path.
     * @param handler - The handler function.
     * @returns The registered Route instance.
     */
    delete(path: string, handler: RouteHandler): Route;
    delete(path: string, request: FormRequestClass, handler: RouteHandler): Route;
    /**
     * Register a PATCH route.
     *
     * @param path - The URL path.
     * @param handler - The handler function.
     * @returns The registered Route instance.
     */
    patch(path: string, handler: RouteHandler): Route;
    patch(path: string, request: FormRequestClass, handler: RouteHandler): Route;
    /**
     * Register a resource route (Laravel-style).
     */
    resource(name: string, controller: ControllerClass, options?: ResourceOptions): void;
    /**
     * Internal Request Registration
     */
    req(method: HttpMethod, path: string, requestOrHandler: FormRequestClass | RouteHandler, handler?: RouteHandler, options?: RouteOptions): Route;
    /**
     * Resolve Controller Instance and Method
     */
    private resolveControllerHandler;
}
export type ResourceAction = 'index' | 'create' | 'store' | 'show' | 'edit' | 'update' | 'destroy';
export interface ResourceOptions {
    only?: ResourceAction[];
    except?: ResourceAction[];
}
//# sourceMappingURL=Router.d.ts.map