import { describe, expect, it, beforeEach } from 'bun:test'
import { RadixRouter } from '../src/adapters/bun/RadixRouter'
import { NodeType } from '../src/adapters/bun/types'

describe('RadixRouter', () => {
    let router: RadixRouter

    beforeEach(() => {
        router = new RadixRouter()
    })

    it('matches static routes', () => {
        const handler = () => { }
        router.add('get', '/users', [handler])
        router.add('post', '/users', [handler])
        router.add('get', '/about', [handler])

        const matchGet = router.match('get', '/users')
        expect(matchGet).not.toBeNull()
        expect(matchGet?.handlers[0]).toBe(handler)

        const matchPost = router.match('post', '/users')
        expect(matchPost).not.toBeNull()

        const matchAbout = router.match('get', '/about')
        expect(matchAbout).not.toBeNull()

        const noMatch = router.match('get', '/contact')
        expect(noMatch).toBeNull()
    })

    it('matches dynamic parameters', () => {
        const handler = () => { }
        router.add('get', '/users/:id', [handler])

        const match = router.match('get', '/users/123')
        expect(match).not.toBeNull()
        expect(match?.params['id']).toBe('123')

        const noMatch = router.match('get', '/users')
        expect(noMatch).toBeNull() // Missing param
    })

    it('handles parameter constraints', () => {
        const handler = () => { }
        router.where('id', /^\d+$/)
        router.add('get', '/users/:id', [handler])

        const matchNum = router.match('get', '/users/123')
        expect(matchNum).not.toBeNull()

        const matchStr = router.match('get', '/users/abc')
        expect(matchStr).toBeNull()
    })

    it('supports wildcards', () => {
        const handler = () => { }
        router.add('get', '/files/*', [handler])

        const match1 = router.match('get', '/files/image.png')
        expect(match1).not.toBeNull()

        const match2 = router.match('get', '/files/path/to/file.txt')
        expect(match2).not.toBeNull()

        // Wildcard matches "rest", so /files/ matches? 
        // Current impl: add() breaks on *, so '*' consumes whatever.
        // If I split '/files/foo', segments are ['files', 'foo'].
        // depth=0: 'files' matches static.
        // depth=1: 'foo'.
        // Node 'files' has wildcardChild.
        // matchRecursive tries wildcard if exists.
        // Note: My impl checks static/param/wildcard in order.
        // If wildcard matches "rest", it should probably match emptiness too?
        // Let's check implicit behavior.

        // In current impl matchRecursive:
        // depth=1 (foo) >= segments.length (2) ? No.
        // ...
        // wildcardChild matches. returns match.

        // What about /files/?
        // segments=['files'].
        // depth=1 >= segments.length (1) -> True.
        // Node 'files' handlers? No.
        // Return null.
        // So /files/ doesn't match /files/*.
    })

    it('prioritizes static over param over wildcard', () => {
        const staticHandler = () => { }
        const paramHandler = () => { }
        const wildcardHandler = () => { }

        router.add('get', '/users/new', [staticHandler])
        router.add('get', '/users/:id', [paramHandler])
        router.add('get', '/users/*', [wildcardHandler])

        // Static priority
        const matchStatic = router.match('get', '/users/new')
        expect(matchStatic?.handlers[0]).toBe(staticHandler)

        // Param priority
        router.where('id', /^\d+$/) // Add constraint to verify it falls through if failed?
        // Let's test basic param match first
        const matchParam = router.match('get', '/users/123')
        expect(matchParam?.handlers[0]).toBe(paramHandler)

        // Wildcard fallback
        // Note: effectively impossible to hit wildcard here if param matches everything.
        // But if we add a constraint to param...
        // router.where('id', /^\d+$/) was NOT called for *this* test case instance (clean state each time?) 
        // Wait, router.where sets global constraint needed BEFORE add().

        // Let's re-setup for constraint fallback
        const router2 = new RadixRouter()
        router2.where('id', /^\d+$/)
        router2.add('get', '/users/:id', [paramHandler])
        router2.add('get', '/users/*', [wildcardHandler])

        // 123 matches param
        const m1 = router2.match('get', '/users/123')
        expect(m1?.handlers[0]).toBe(paramHandler)

        // 'abc' fails param constraint -> should fallback to wildcard?
        // My impl:
        // 3. Try Param Match -> Constraint check -> if fail, do NOT return match.
        // 4. Try Wildcard Match -> matches.
        const m2 = router2.match('get', '/users/abc')
        expect(m2?.handlers[0]).toBe(wildcardHandler)
    })

    it('decodes parameters', () => {
        const handler = () => { }
        router.add('get', '/search/:query', [handler])

        const match = router.match('get', '/search/foo%20bar')
        expect(match?.params['query']).toBe('foo bar')
    })
})
