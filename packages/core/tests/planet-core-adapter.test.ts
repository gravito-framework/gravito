
import { describe, it, expect } from 'bun:test'
import { PlanetCore } from '../src/PlanetCore'
import { BunNativeAdapter } from '../src/adapters/bun/BunNativeAdapter'
import { HonoAdapter } from '../src/adapters/HonoAdapter'

describe('PlanetCore Default Adapter', () => {
    it('should use BunNativeAdapter by default in Bun environment', () => {
        const core = new PlanetCore()
        expect(core.adapter).toBeInstanceOf(BunNativeAdapter)
        expect(core.adapter.name).toBe('bun-native')
    })

    it('should allow overriding adapter via constructor', () => {
        const honoAdapter = new HonoAdapter()
        const core = new PlanetCore({ adapter: honoAdapter })
        expect(core.adapter).toBeInstanceOf(HonoAdapter)
        expect(core.adapter).toBe(honoAdapter)
    })
})
