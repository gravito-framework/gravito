import type {
  ContentfulStatusCode,
  GravitoContext,
  GravitoVariables,
  StatusCode,
} from '../../http/types'
import { BunRequest } from './BunRequest'
export declare class BunContext<V extends GravitoVariables = GravitoVariables>
  implements GravitoContext<V>
{
  readonly env: Record<string, unknown>
  readonly req: BunRequest
  private _variables
  private _status
  private _headers
  private _executionCtx?
  res: Response | undefined
  readonly native: unknown
  constructor(request: Request, env?: Record<string, unknown>, executionCtx?: ExecutionContext)
  json<T>(data: T, status?: ContentfulStatusCode): Response
  text(text: string, status?: ContentfulStatusCode): Response
  html(html: string, status?: ContentfulStatusCode): Response
  redirect(url: string, status?: 301 | 302 | 303 | 307 | 308): Response
  body(data: BodyInit | null, status?: StatusCode): Response
  stream(stream: ReadableStream, status?: ContentfulStatusCode): Response
  header(
    name: string,
    value: string,
    options?: {
      append?: boolean
    }
  ): void
  header(name: string): string | undefined
  status(code: StatusCode): void
  get<K extends keyof V>(key: K): V[K]
  set<K extends keyof V>(key: K, value: V[K]): void
  get executionCtx(): ExecutionContext | undefined
}
//# sourceMappingURL=BunContext.d.ts.map
