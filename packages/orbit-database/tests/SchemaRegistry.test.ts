/**
 * Schema Registry Tests
 */

import { describe, expect, it, beforeEach, afterEach } from 'bun:test'
import { SchemaRegistry, SchemaSniffer } from '../src/orm'
import { writeFileSync, unlinkSync, existsSync } from 'node:fs'

describe('SchemaRegistry', () => {
    beforeEach(() => {
        SchemaRegistry.reset()
    })

    describe('init', () => {
        it('should initialize with default JIT mode in dev', () => {
            const registry = SchemaRegistry.init({ mode: 'jit' })
            expect(registry).toBeDefined()
            expect(registry.isInitialized).toBe(true)
        })

        it('should allow custom lock path', () => {
            const registry = SchemaRegistry.init({
                mode: 'jit',
                lockPath: './custom-schema.lock.json'
            })
            expect(registry).toBeDefined()
        })
    })

    describe('getInstance', () => {
        it('should return singleton instance', () => {
            const a = SchemaRegistry.getInstance()
            const b = SchemaRegistry.getInstance()
            expect(a).toBe(b)
        })

        it('should auto-init if not initialized', () => {
            const registry = SchemaRegistry.getInstance()
            expect(registry.isInitialized).toBe(true)
        })
    })

    describe('reset', () => {
        it('should clear singleton instance', () => {
            const a = SchemaRegistry.getInstance()
            SchemaRegistry.reset()
            const b = SchemaRegistry.getInstance()
            expect(a).not.toBe(b)
        })
    })

    describe('has', () => {
        it('should return false for uncached tables', () => {
            const registry = SchemaRegistry.init({ mode: 'jit' })
            expect(registry.has('nonexistent')).toBe(false)
        })
    })

    describe('getTables', () => {
        it('should return empty array initially', () => {
            const registry = SchemaRegistry.init({ mode: 'jit' })
            expect(registry.getTables()).toEqual([])
        })
    })

    describe('clearCache', () => {
        it('should clear all cached schemas', () => {
            const registry = SchemaRegistry.init({ mode: 'jit' })
            registry.clearCache()
            expect(registry.getTables()).toEqual([])
        })
    })

    describe('loadFromLock', () => {
        const lockPath = './test-schema.lock.json'

        afterEach(() => {
            if (existsSync(lockPath)) {
                unlinkSync(lockPath)
            }
        })

        it('should throw if lock file not found', () => {
            expect(() => {
                SchemaRegistry.init({ mode: 'aot', lockPath: './not-exists.json' })
            }).toThrow(/Schema lock file not found/)
        })

        it('should load schemas from lock file', () => {
            const lock = {
                version: '1.0',
                driver: 'postgres',
                generatedAt: new Date().toISOString(),
                tables: {
                    users: {
                        table: 'users',
                        columns: [
                            { name: 'id', type: 'integer', nullable: false, primary: true, unique: true, autoIncrement: true },
                            { name: 'name', type: 'string', nullable: true, primary: false, unique: false, autoIncrement: false }
                        ],
                        primaryKey: ['id']
                    }
                }
            }
            writeFileSync(lockPath, JSON.stringify(lock))

            SchemaRegistry.reset()
            const registry = SchemaRegistry.init({ mode: 'aot', lockPath })

            expect(registry.has('users')).toBe(true)
            expect(registry.getTables()).toContain('users')
        })
    })
})

describe('SchemaSniffer', () => {
    it('should create instance', () => {
        const sniffer = new SchemaSniffer()
        expect(sniffer).toBeDefined()
    })

    it('should create instance with connection name', () => {
        const sniffer = new SchemaSniffer('mysql')
        expect(sniffer).toBeDefined()
    })
})
