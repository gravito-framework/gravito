import { UseCase } from '@gravito/enterprise'
import type { IMemberRepository } from '../../Domain/Contracts/IMemberRepository'
import { PlanetCore } from 'gravito-core'

export interface ForgotPasswordInput {
  email: string
}

export class ForgotPassword extends UseCase<ForgotPasswordInput, void> {
  constructor(
    private repository: IMemberRepository,
    private core: PlanetCore
  ) {
    super()
  }

  async execute(input: ForgotPasswordInput): Promise<void> {
    const member = await this.repository.findByEmail(input.email)
    
    if (!member) {
      // Security: Don't reveal if user exists
      return
    }

    member.generatePasswordResetToken()
    await this.repository.save(member)

    // Trigger hook to send reset email
    await this.core.hooks.doAction('membership:send-reset-password', {
      email: member.email,
      token: member.passwordResetToken
    })
  }
}
