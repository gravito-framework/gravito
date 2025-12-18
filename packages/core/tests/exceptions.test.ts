import { describe, expect, test, mock } from 'bun:test'
import { PlanetCore } from '../src/PlanetCore'
import { GravitoException } from '../src/exceptions/GravitoException'
import { ValidationException } from '../src/exceptions/ValidationException'
import type { Context } from 'hono'

class TestException extends GravitoException {
    constructor() {
        super(400, 'TEST_ERROR', { message: 'Test Message' })
    }
}

describe('Exception Handling', () => {
    test('handles GravitoException as JSON', async () => {
        const core = new PlanetCore()
        core.app.get('/error', () => {
            throw new TestException()
        })

        const res = await core.app.request('/error', {
            headers: { Accept: 'application/json' },
        })
        expect(res.status).toBe(400)
        const json = await res.json()
        expect(json.success).toBe(false)
        expect(json.error.code).toBe('TEST_ERROR')
        expect(json.error.message).toBe('Test Message')
    })

    test('handles ValidationException redirect for HTML with flash', async () => {
        const core = new PlanetCore()

        const flashMock = mock((key: string, value: unknown) => { })
        const sessionMock = {
            flash: flashMock
        }

        core.app.use('*', async (c, next) => {
            c.set('session', sessionMock)
            c.set('view', { render: () => '' }) // Enable HTML mode
            await next()
        })

        core.app.get('/form', () => {
            const ex = new ValidationException([{ field: 'email', message: 'Invalid' }])
            ex.withInput({ email: 'bad' })
            throw ex
        })

        const res = await core.app.request('/form', {
            headers: { Accept: 'text/html' },
        })

        expect(res.status).toBe(302)
        expect(flashMock).toHaveBeenCalledTimes(2) // errors + _old_input
        // Check arguments if possible, or just basic flow
    })
})
