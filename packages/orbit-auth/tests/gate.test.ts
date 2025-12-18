import { describe, expect, it } from 'bun:test'
import { Gate } from '../src/Gate'
import type { Authenticatable } from '../src/contracts/Authenticatable'

class User implements Authenticatable {
    constructor(public id: string, public role: string = 'user') { }
    getAuthIdentifier() { return this.id }
}

class Post {
    constructor(public userId: string) { }
}

class PostPolicy {
    update(user: User, post: Post) {
        return user.id === post.userId
    }
}

describe('Gate', () => {
    it('should define and check abilities', async () => {
        const user = new User('1')
        const gate = new Gate().forUser(() => Promise.resolve(user))

        gate.define('isAdmin', (u) => (u as User).role === 'admin')

        expect(await gate.allows('isAdmin')).toBe(false)

        user.role = 'admin'
        expect(await gate.allows('isAdmin')).toBe(true)
    })

    it('should support policies', async () => {
        const user = new User('1')
        const otherUser = new User('2')
        const post = new Post('1')

        const gate = new Gate().forUser(() => Promise.resolve(user))
        gate.policy(Post, new PostPolicy())

        expect(await gate.allows('update', post)).toBe(true)

        const otherGate = new Gate().forUser(() => Promise.resolve(otherUser))
        otherGate.policy(Post, new PostPolicy())

        expect(await otherGate.allows('update', post)).toBe(false)
    })

    it('should support before check', async () => {
        const user = new User('1', 'admin')
        const gate = new Gate().forUser(() => Promise.resolve(user))

        gate.before((u) => (u as User).role === 'admin' ? true : undefined)
        gate.define('foo', () => false)

        expect(await gate.allows('foo')).toBe(true) // Overridden by before
    })
})
