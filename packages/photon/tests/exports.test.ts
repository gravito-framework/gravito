import { describe, expect, it, mock } from 'bun:test'
import { Hono } from 'hono'
import * as honoBun from 'hono/bun'
import * as honoClient from 'hono/client'
import * as honoHttpException from 'hono/http-exception'
import * as honoLogger from 'hono/logger'
import * as honoRegExpRouter from 'hono/router/reg-exp-router'
import * as honoTrieRouter from 'hono/router/trie-router'
import * as bunExports from '../src/bun'
import * as clientExports from '../src/client'
import * as httpExceptionExports from '../src/http-exception'
import { Photon } from '../src/index'
import * as loggerExports from '../src/logger'
import * as regExpRouterExports from '../src/router/reg-exp-router'
import * as trieRouterExports from '../src/router/trie-router'

const keys = (mod: Record<string, unknown>) => Object.keys(mod).sort()

const jwtStub = {
  jwt: () => null,
  verify: () => null,
  decode: () => null,
  sign: () => null,
  verifyWithJwks: () => null,
}

mock.module('hono/jwt', () => jwtStub)

describe('photon exports', () => {
  it('aliases Hono as Photon', () => {
    expect(Photon).toBe(Hono)
    expect(new Photon()).toBeInstanceOf(Hono)
  })

  it('re-exports hono/bun helpers', () => {
    expect(keys(bunExports)).toEqual(keys(honoBun))
  })

  it('re-exports hono/client helpers', () => {
    expect(keys(clientExports)).toEqual(keys(honoClient))
  })

  it('re-exports hono/logger helpers', () => {
    expect(keys(loggerExports)).toEqual(keys(honoLogger))
  })

  it('re-exports hono/http-exception helpers', () => {
    expect(keys(httpExceptionExports)).toEqual(keys(honoHttpException))
  })

  it('re-exports jwt helpers via compat shim', async () => {
    const jwtExports = await import('../src/jwt')
    expect(jwtExports.jwt).toBe(jwtStub.jwt)
    expect(jwtExports.verify).toBe(jwtStub.verify)
    expect(jwtExports.decode).toBe(jwtStub.decode)
    expect(jwtExports.sign).toBe(jwtStub.sign)
    expect(jwtExports.verifyWithJwks).toBe(jwtStub.verifyWithJwks)
  })

  it('re-exports hono router helpers', () => {
    expect(keys(regExpRouterExports)).toEqual(keys(honoRegExpRouter))
    expect(keys(trieRouterExports)).toEqual(keys(honoTrieRouter))
  })
})
