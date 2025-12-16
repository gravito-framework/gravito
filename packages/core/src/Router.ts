import type { Handler } from 'hono';
import type { PlanetCore } from './PlanetCore';

// Type for Controller Class Constructor
// biome-ignore lint/suspicious/noExplicitAny: Controllers can have any shape
export type ControllerClass = new (core: PlanetCore) => any;

// Handler can be a function or [Class, 'methodName']
export type RouteHandler = Handler | [ControllerClass, string];

interface RouteOptions {
  prefix?: string;
  domain?: string;
}

/**
 * RouteGroup
 * Helper class for chained route configuration (prefix, domain, etc.)
 */
export class RouteGroup {
  constructor(
    private router: Router,
    private options: RouteOptions
  ) {}

  /**
   * Add a prefix to the current group
   */
  prefix(path: string): RouteGroup {
    return new RouteGroup(this.router, {
      ...this.options,
      prefix: (this.options.prefix || '') + path,
    });
  }

  /**
   * Define routes within this group
   */
  group(callback: (router: Router | RouteGroup) => void): void {
    // We pass 'this' as the router to the callback
    // So when they call .get(), it uses our scoped methods
    callback(this);
  }

  // Proxy HTTP methods to the main router with options merged
  get(path: string, handler: RouteHandler) {
    this.router.req('get', path, handler, this.options);
  }
  post(path: string, handler: RouteHandler) {
    this.router.req('post', path, handler, this.options);
  }
  put(path: string, handler: RouteHandler) {
    this.router.req('put', path, handler, this.options);
  }
  delete(path: string, handler: RouteHandler) {
    this.router.req('delete', path, handler, this.options);
  }
  patch(path: string, handler: RouteHandler) {
    this.router.req('patch', path, handler, this.options);
  }
}

/**
 * Gravito Router
 *
 * Provides a Laravel-like fluent API for defining routes.
 * Supports:
 * - Controller-based routing: router.get('/', [HomeController, 'index'])
 * - Route groups with prefixes: router.prefix('/api').group(...)
 * - Domain-based routing: router.domain('api.app').group(...)
 */
export class Router {
  // Singleton cache for controllers
  // biome-ignore lint/suspicious/noExplicitAny: Cache stores instances of any controller
  private controllers = new Map<ControllerClass, any>();

  constructor(private core: PlanetCore) {}

  /**
   * Start a route group with a prefix
   */
  prefix(path: string): RouteGroup {
    return new RouteGroup(this, { prefix: path });
  }

  /**
   * Start a route group with a domain constraint
   */
  domain(host: string): RouteGroup {
    return new RouteGroup(this, { domain: host });
  }

  // Standard HTTP Methods
  get(path: string, handler: RouteHandler) {
    this.req('get', path, handler);
  }
  post(path: string, handler: RouteHandler) {
    this.req('post', path, handler);
  }
  put(path: string, handler: RouteHandler) {
    this.req('put', path, handler);
  }
  delete(path: string, handler: RouteHandler) {
    this.req('delete', path, handler);
  }
  patch(path: string, handler: RouteHandler) {
    this.req('patch', path, handler);
  }

  /**
   * Internal Request Registration
   */
  req(method: string, path: string, handler: RouteHandler, options: RouteOptions = {}) {
    // 1. Resolve Path
    const fullPath = (options.prefix || '') + path;

    // 2. Resolve Handler (Controller vs Function)
    let finalHandler: Handler;

    if (Array.isArray(handler)) {
      const [CtrlClass, methodName] = handler;
      finalHandler = this.resolveControllerHandler(CtrlClass, methodName);
    } else {
      finalHandler = handler;
    }

    // 3. Register with Hono
    // If domain is present, wrap in domain check middleware
    if (options.domain) {
      // Note: This creates a unique middleware per route which is fine for small apps,
      // but optimally we would group them in a Hono sub-app via mount.
      // For now, simple middleware check is "lightweight" enough.
      const domainHandler: Handler = async (c, next) => {
        const host = c.req.header('host');
        // Simple exact match (can be improved to regex later)
        if (host !== options.domain) {
          // If using sub-domains, usually we want to 404 if domain doesn't match?
          // But here we just continue to next route if strictly inside a monolithic app routing table
          // However, Hono routing is tree-based.
          // If we register specific path, Hono matches path first.
          // If we return next(), Hono tries next handler.
          return next();
        }
        return finalHandler(c, next);
      };
      (this.core.app as any)[method](fullPath, domainHandler);
    } else {
      (this.core.app as any)[method](fullPath, finalHandler);
    }
  }

  /**
   * Resolve Controller Instance and Method
   */
  private resolveControllerHandler(CtrlClass: ControllerClass, methodName: string): Handler {
    // 1. Get or Create Controller Instance
    let instance = this.controllers.get(CtrlClass);
    if (!instance) {
      instance = new CtrlClass(this.core);
      this.controllers.set(CtrlClass, instance);
    }

    // 2. Check method existence
    if (typeof instance[methodName] !== 'function') {
      throw new Error(`Method '${methodName}' not found in controller '${CtrlClass.name}'`);
    }

    // 3. Bind context
    return instance[methodName].bind(instance);
  }
}
