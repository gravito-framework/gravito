import type { Context } from 'hono'
import { AuthenticationException } from 'gravito-core'
import type { Authenticatable } from './contracts/Authenticatable'
import type { Guard, StatefulGuard } from './contracts/Guard'
import type { UserProvider } from './contracts/UserProvider'
import { JwtGuard } from './guards/JwtGuard'
import { SessionGuard } from './guards/SessionGuard'
import { TokenGuard } from './guards/TokenGuard'

export interface AuthConfig {
    defaults: {
        guard: string
        passwords?: string // provider name
    }
    guards: Record<string, {
        driver: 'session' | 'jwt' | 'token' | string
        provider?: string
        [key: string]: any
    }>
    providers: Record<string, {
        driver: 'callback' | string
        [key: string]: any
    }>
}

export type UserProviderResolver = (config: any) => UserProvider
export type GuardResolver = (ctx: Context, name: string, config: any, provider: UserProvider) => Guard

export class AuthManager {
    protected guards: Map<string, Guard> = new Map()
    protected customGuardCreators: Map<string, GuardResolver> = new Map()
    protected customProviderCreators: Map<string, UserProviderResolver> = new Map()

    // Cache resolved providers to share across guards if needed
    protected resolvedProviders: Map<string, UserProvider> = new Map()

    constructor(
        protected ctx: Context,
        protected config: AuthConfig,
        protected providerResolvers: Map<string, UserProviderResolver> = new Map()
    ) { }

    public shouldUse(name: string): this {
        this.config.defaults.guard = name
        return this
    }

    public guard<T extends Guard = Guard>(name?: string): T {
        const guardName = name || this.config.defaults.guard

        if (!this.guards.has(guardName)) {
            this.guards.set(guardName, this.resolve(guardName))
        }

        return this.guards.get(guardName) as T
    }

    public async user<T extends Authenticatable = Authenticatable>(): Promise<T | null> {
        return this.guard().user() as Promise<T | null>
    }

    public async id(): Promise<string | number | null> {
        return this.guard().id()
    }

    public async check(): Promise<boolean> {
        return this.guard().check()
    }

    public async authenticate(): Promise<Authenticatable> {
        const user = await this.user()
        if (!user) {
            throw new AuthenticationException()
        }
        return user
    }

    /**
     * Attempt to authenticate using the default driver.
     */
    public async attempt(credentials: Record<string, unknown>, remember = false): Promise<boolean> {
        const guard = this.guard()
        if ('attempt' in guard) {
            return (guard as unknown as StatefulGuard).attempt(credentials, remember)
        }
        return guard.validate(credentials)
    }

    public async login(user: Authenticatable, remember = false): Promise<void> {
        const guard = this.guard()
        if ('login' in guard) {
            return (guard as unknown as StatefulGuard).login(user, remember)
        }
    }

    public async logout(): Promise<void> {
        const guard = this.guard()
        if ('logout' in guard) {
            return (guard as unknown as StatefulGuard).logout()
        }
    }

    protected resolve(name: string): Guard {
        const config = this.config.guards[name]

        if (!config) {
            throw new Error(`Auth guard [${name}] is not defined.`)
        }

        if (config.driver === 'session') {
            return this.createSessionGuard(name, config)
        }

        if (config.driver === 'jwt') {
            return this.createJwtGuard(name, config)
        }

        if (config.driver === 'token') {
            return this.createTokenGuard(name, config)
        }

        if (this.customGuardCreators.has(config.driver)) {
            const providerName = config.provider
            const provider = providerName ? this.createUserProvider(providerName) : null
            if (!provider && providerName) {
                throw new Error(`User provider [${providerName}] not found for guard [${name}].`)
            }
            return this.customGuardCreators.get(config.driver)!(this.ctx, name, config, provider!)
        }

        throw new Error(`Auth driver [${config.driver}] for guard [${name}] is not supported.`)
    }

    protected createSessionGuard(name: string, config: any): SessionGuard {
        const provider = this.createUserProvider(config.provider)
        return new SessionGuard(name, provider, this.ctx, config.sessionKey)
    }

    protected createJwtGuard(name: string, config: any): JwtGuard {
        const provider = this.createUserProvider(config.provider)
        return new JwtGuard(provider, this.ctx, config.secret, config.algo)
    }

    protected createTokenGuard(name: string, config: any): TokenGuard {
        const provider = this.createUserProvider(config.provider)
        return new TokenGuard(provider, this.ctx, config.inputKey, config.storageKey, config.hash)
    }

    public createUserProvider(name?: string): UserProvider {
        const providerName = name || this.config.defaults.passwords || 'users'

        if (this.resolvedProviders.has(providerName)) {
            return this.resolvedProviders.get(providerName)!
        }

        const config = this.config.providers[providerName]

        if (!config) {
            throw new Error(`User provider [${providerName}] is not defined.`)
        }

        let provider: UserProvider | null = null

        if (config.driver === 'callback') {
            if (this.providerResolvers.has(providerName)) {
                provider = this.providerResolvers.get(providerName)!(config)
            }
        } else if (this.customProviderCreators.has(config.driver)) {
            provider = this.customProviderCreators.get(config.driver)!(config)
        }

        if (!provider) {
            if (this.providerResolvers.has(providerName)) {
                provider = this.providerResolvers.get(providerName)!(config)
            }
        }

        if (!provider) {
            throw new Error(`Auth provider driver [${config.driver}] for [${providerName}] is not supported or not registered.`)
        }

        this.resolvedProviders.set(providerName, provider)
        return provider
    }

    public extend(driver: string, callback: GuardResolver): this {
        this.customGuardCreators.set(driver, callback)
        return this
    }

    public provider(name: string, callback: UserProviderResolver): this {
        this.customProviderCreators.set(name, callback)
        return this
    }
}
