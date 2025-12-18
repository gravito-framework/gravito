import { HTTPException } from 'hono/http-exception'
import type { ContentfulStatusCode } from 'hono/utils/http-status'

export interface ExceptionOptions {
    message?: string
    cause?: unknown
    i18nKey?: string // e.g. 'errors.validation.failed'
    i18nParams?: Record<string, string | number>
}

export abstract class GravitoException extends HTTPException {
    public readonly code: string
    public readonly i18nKey?: string
    public readonly i18nParams?: Record<string, string | number>

    constructor(status: number, code: string, options: ExceptionOptions = {}) {
        super(status as ContentfulStatusCode, {
            ...(options.message ? { message: options.message } : {}),
            cause: options.cause,
        })
        this.code = code
        if (options.i18nKey) {
            this.i18nKey = options.i18nKey
        }
        if (options.i18nParams) {
            this.i18nParams = options.i18nParams
        }
    }

    // Helper for i18n
    getLocalizedMessage(
        t: (key: string, params?: Record<string, string | number>) => string
    ): string {
        if (this.i18nKey) {
            return t(this.i18nKey, this.i18nParams)
        }
        return this.message
    }
}
