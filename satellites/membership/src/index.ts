import { ServiceProvider, type Container } from 'gravito-core'
import { AtlasMemberRepository } from './Infrastructure/Persistence/AtlasMemberRepository'
import { RegisterMember } from './Application/UseCases/RegisterMember'
import { LoginMember } from './Application/UseCases/LoginMember'
import { ForgotPassword } from './Application/UseCases/ForgotPassword'
import { ResetPassword } from './Application/UseCases/ResetPassword'
import { VerifyEmail } from './Application/UseCases/VerifyEmail'
import { UpdateSettings } from './Application/UseCases/UpdateSettings'
import { UpdateMemberLevel } from './Application/UseCases/UpdateMemberLevel'
import { SentinelMemberProvider } from './Infrastructure/Auth/SentinelMemberProvider'
import { WelcomeMail } from './Application/Mail/WelcomeMail'
import { ForgotPasswordMail } from './Application/Mail/ForgotPasswordMail'
import { MemberLevelChangedMail } from './Application/Mail/MemberLevelChangedMail'

/**
 * Membership Satellite Service Provider
 * 
 * Handles the registration and initialization of membership services.
 * Optimized for Bun runtime with full i18n support.
 */
export class MembershipServiceProvider extends ServiceProvider {
  /**
   * Register bindings in the container
   */
  register(container: Container): void {
    if (!container.has('cache')) {
      const cacheFromServices = this.core?.services.get('cache')
      if (cacheFromServices) {
        container.instance('cache', cacheFromServices)
      }
    }

    // Bind Repository
    container.singleton('membership.repo', () => new AtlasMemberRepository())
    
    // Bind Sentinel Auth Provider (Dogfooding Sentinel)
    container.singleton('auth.member_provider', () => new SentinelMemberProvider(container.make('membership.repo')))
    
    // Bind UseCases
    container.singleton('membership.register', () => {
        return new RegisterMember(container.make('membership.repo'), this.core!)
    })

    container.singleton('membership.login', () => {
        return new LoginMember(container.make('membership.repo'), this.core!)
    })

    container.singleton('membership.forgot-password', () => {
        return new ForgotPassword(container.make('membership.repo'), this.core!)
    })

    container.singleton('membership.reset-password', () => {
        return new ResetPassword(container.make('membership.repo'), this.core!)
    })

    container.singleton('membership.verify-email', () => {
        return new VerifyEmail(container.make('membership.repo'))
    })

    container.singleton('membership.update-settings', () => {
        return new UpdateSettings(container.make('membership.repo'), this.core!)
    })

    container.singleton('membership.update-level', () => {
        return new UpdateMemberLevel(container.make('membership.repo'), this.core!)
    })
  }

  /**
   * Expose migration path using Bun-native import.meta.dir
   */
  getMigrationsPath(): string {
    return `${import.meta.dir}/Infrastructure/Persistence/Migrations`
  }

  /**
   * Boot the satellite
   * Loads local translations into the global i18n system.
   */
  override async boot(): Promise<void> {
    const logger = this.core?.logger
    const i18n = this.core?.container.make<any>('i18n')

    if (i18n) {
      try {
        // Bun-native JSON loading
        const en = await Bun.file(`${import.meta.dir}/../locales/en.json`).json()
        const zhTW = await Bun.file(`${import.meta.dir}/../locales/zh-TW.json`).json()
        
        i18n.addResource('en', 'membership', en)
        i18n.addResource('zh-TW', 'membership', zhTW)
      } catch (err) {
        logger?.warn('[Membership] Failed to load localizations')
      }
    }

    // Register Hooks
    if (this.core) {
      this.core.hooks.addAction('membership:send-verification', async (data: { email: string, token: string }) => {
        try {
          const mail = this.core?.container.make<any>('mail')
          if (mail) {
            await mail.queue(new WelcomeMail(data.email, data.token))
          }
        } catch (err) {
          this.core?.logger.error('[Membership] Failed to send verification email', err)
        }
      })

      this.core.hooks.addAction('membership:send-reset-password', async (data: { email: string, token: string }) => {
        try {
          const mail = this.core?.container.make<any>('mail')
          if (mail) {
            await mail.queue(new ForgotPasswordMail(data.email, data.token))
          }
        } catch (err) {
          this.core?.logger.error('[Membership] Failed to send reset password email', err)
        }
      })

      this.core.hooks.addAction('membership:level-changed', async (data: { email: string, oldLevel: string, newLevel: string }) => {
        try {
          const mail = this.core?.container.make<any>('mail')
          if (mail) {
            await mail.queue(new MemberLevelChangedMail(data.email, data.oldLevel, data.newLevel))
          }
        } catch (err) {
          this.core?.logger.error('[Membership] Failed to send level change email', err)
        }
      })
    }

    const startMsg = i18n?.t('membership.notifications.operational') || '🛰️ Satellite Membership is operational'
    logger?.info(startMsg)
  }
}
