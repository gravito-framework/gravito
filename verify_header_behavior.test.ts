
import { Hono } from 'hono'
import { HonoAdapter } from './packages/core/src/adapters/HonoAdapter'
import { describe, expect, it } from 'bun:test'

describe('HonoAdapter Header Behavior', () => {
    it('sets headers after next()', async () => {
        const adapter = new HonoAdapter()

        // Middleware that sets header after next
        adapter.use('*', async (ctx, next) => {
            await next()
            ctx.header('X-Test-After', 'Success', { append: true })
        })

        adapter.route('get', '/test', (ctx) => {
            return ctx.json({ ok: true })
        })

        const res = await adapter.fetch(new Request('http://localhost/test'))
        console.log('Headers:', Object.fromEntries(res.headers.entries()))
        expect(res.headers.get('x-test-after')).toBe('Success')
    })

    it('sets multiple cookies', async () => {
        const adapter = new HonoAdapter()

        adapter.use('*', async (ctx, next) => {
            await next()
            ctx.header('Set-Cookie', 'a=1', { append: true })
            ctx.header('Set-Cookie', 'b=2', { append: true })
        })

        adapter.route('get', '/cookies', (ctx) => {
            return ctx.json({ ok: true })
        })

        const res = await adapter.fetch(new Request('http://localhost/cookies'))
        const cookies = res.headers.getAll ? res.headers.getAll('set-cookie') : res.headers.get('set-cookie')
        console.log('Cookies:', cookies)
        // Check if string contains both
        if (typeof cookies === 'string') {
            expect(cookies).toContain('a=1')
            expect(cookies).toContain('b=2')
        } else {
            // Bun might return array if we use getAll? standard Request/Response doesn't have getAll usually unless special?
            // Bun's Response headers might have getSetCookie?
            const setCookies = res.headers.getSetCookie ? res.headers.getSetCookie() : null
            console.log('getSetCookie:', setCookies)
            if (setCookies) {
                expect(setCookies).toContain('a=1')
                expect(setCookies).toContain('b=2')
            }
        }
    })
})
