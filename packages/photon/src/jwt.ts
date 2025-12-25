import type * as HonoJwt from 'hono/jwt'

// Bun can require hono/jwt but ESM import may fail; proxy via require for runtime.
const honoJwt = require('hono/jwt') as typeof HonoJwt

export const jwt = honoJwt.jwt
export const verify = honoJwt.verify
export const decode = honoJwt.decode
export const sign = honoJwt.sign
export const verifyWithJwks = honoJwt.verifyWithJwks

export type { JwtFunction, JwtHeader, JwtOptions, JwtPayload } from 'hono/jwt'
