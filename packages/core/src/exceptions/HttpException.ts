import type { ContentfulStatusCode } from '../http/types'
import { type ExceptionOptions, GravitoException } from './GravitoException'

export class HttpException extends GravitoException {
  constructor(status: ContentfulStatusCode, options: ExceptionOptions = {}) {
    super(status, 'HTTP_ERROR', options)
    this.name = 'HttpException'
  }
}
