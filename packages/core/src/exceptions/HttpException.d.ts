import type { ContentfulStatusCode } from '../http/types';
import { type ExceptionOptions, GravitoException } from './GravitoException';
export declare class HttpException extends GravitoException {
    constructor(status: ContentfulStatusCode, options?: ExceptionOptions);
}
//# sourceMappingURL=HttpException.d.ts.map