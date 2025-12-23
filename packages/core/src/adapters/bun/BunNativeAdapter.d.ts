import type {
  GravitoContext,
  GravitoErrorHandler,
  GravitoHandler,
  GravitoMiddleware,
  GravitoNotFoundHandler,
  HttpMethod,
} from '../../http/types'
import type { HttpAdapter, RouteDefinition } from '../types'
export declare class BunNativeAdapter implements HttpAdapter {
  readonly name = 'bun-native'
  readonly version = '0.0.1'
  get native(): unknown
  private router
  private middlewares
  private errorHandler
  private notFoundHandler
  route(method: HttpMethod, path: string, ...handlers: (GravitoHandler | GravitoMiddleware)[]): void
  routes(routes: RouteDefinition[]): void
  use(path: string, ...middleware: GravitoMiddleware[]): void
  useGlobal(...middleware: GravitoMiddleware[]): void
  mount(path: string, subAdapter: HttpAdapter): void
  createContext(request: Request): GravitoContext
  onError(handler: GravitoErrorHandler): void
  onNotFound(handler: GravitoNotFoundHandler): void
  fetch(request: Request, _server?: unknown): Promise<Response>
  private executeChain
}
//# sourceMappingURL=BunNativeAdapter.d.ts.map
