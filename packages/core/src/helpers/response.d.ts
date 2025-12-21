import type { GravitoContext, ContentfulStatusCode } from '../http/types';
export type ApiSuccess<T> = {
    success: true;
    data: T;
};
export type ApiFailure = {
    success: false;
    error: {
        message: string;
        code?: string;
        details?: unknown;
    };
};
export declare function ok<T>(data: T): ApiSuccess<T>;
export declare function fail(message: string, code?: string, details?: unknown): ApiFailure;
export declare function jsonSuccess<T>(c: GravitoContext, data: T, status?: ContentfulStatusCode): Response;
export declare function jsonFail(c: GravitoContext, message: string, status?: ContentfulStatusCode, code?: string, details?: unknown): Response;
//# sourceMappingURL=response.d.ts.map