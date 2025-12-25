import type { MiddlewareHandler } from 'hono'
import type * as HonoJwt from 'hono/jwt'

// Bun can require hono/jwt but ESM import may fail; proxy via require for runtime.
const honoJwt = require('hono/jwt') as typeof HonoJwt

export const jwt = honoJwt.jwt
export const verify = honoJwt.verify
export const decode = honoJwt.decode
export const sign = honoJwt.sign
export const verifyWithJwks = honoJwt.verifyWithJwks

/**
 * Compatibility types for Hono v4
 */
export type JwtPayload = any // Fallback to any for now to avoid deep internal imports that might break
export type JwtHeader = any
export type JwtOptions = any
export type JwtFunction = (options: any) => MiddlewareHandler
