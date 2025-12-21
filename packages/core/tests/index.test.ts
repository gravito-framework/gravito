import { describe, expect, it } from 'bun:test'
import { Hono } from 'hono'
import packageJson from '../package.json'
import { PlanetCore, VERSION } from '../src/index'

describe('gravito-core', () => {
  describe('VERSION', () => {
    it('should export the correct version from package.json', () => {
      expect(VERSION).toBe(packageJson.version)
    })

    it('should be a valid semver string', () => {
      expect(VERSION).toMatch(/^\d+\.\d+\.\d+/)
    })
  })

  describe('PlanetCore Integration', () => {
    it('should register filters and process data', async () => {
      const core = new PlanetCore()

      core.hooks.addFilter('test_filter', (val: string) => val.toUpperCase())

      const result = await core.hooks.applyFilters('test_filter', 'hello')
      expect(result).toBe('HELLO')
    })

    it('should trigger actions', async () => {
      const core = new PlanetCore()
      let count = 0

      core.hooks.addAction('test_action', () => {
        count++
      })

      await core.hooks.doAction('test_action', {})
      expect(count).toBe(1)
    })

    it('should mount orbits and serve requests', async () => {
      const core = new PlanetCore()
      const orbit = new Hono()
      orbit.use('*', async (c, next) => {
        console.log('[DEBUG] Orbit Request:', c.req.method, c.req.url, c.req.path)
        await next()
      })

      orbit.get('/ping', (c) => c.text('pong'))
      orbit.all('*', (c) => {
        console.log('[DEBUG] Catch-all:', c.req.path, c.req.method)
        return c.text('Catch-all', 404)
      })
      core.mountOrbit('/orbit', orbit)

      // Use the liftoff fetch method to test
      const { fetch } = core.liftoff(0) // port 0 for random free port

      const res = await fetch(new Request('http://localhost/orbit/ping'))
      const text = await res.text()
      console.log('Response text:', text)
      console.log('Response status:', res.status)
      expect(text).toBe('pong')
    })
  })
})
