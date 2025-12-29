import { UseCase } from '@gravito/enterprise'
import type { IAdminUserRepository } from '../../Domain/Contracts/IAdminUserRepository'
import type { AdminUser } from '../../Domain/Entities/AdminUser'

export interface LoginAdminInput {
  email: string
  passwordRaw: string
}

export interface LoginAdminOutput {
  user: AdminUser
  token: string
}

export class LoginAdmin extends UseCase<LoginAdminInput, LoginAdminOutput> {
  constructor(private repository: IAdminUserRepository) {
    super()
  }

  async execute(input: LoginAdminInput): Promise<LoginAdminOutput> {
    const admin = await this.repository.findByEmail(input.email)

    if (!admin) {
      throw new Error('Invalid credentials.')
    }

    // 這裡應檢查密碼雜湊，暫時使用簡單對比模擬
    // 假設 passwordHash 是 "hashed_" + raw
    const isValid = (admin as any).props.passwordHash === `hashed_${input.passwordRaw}`

    if (!isValid) {
      throw new Error('Invalid credentials.')
    }

    if (!admin.isActive) {
      throw new Error('Account is deactivated.')
    }

    // 模擬產生 JWT Token
    const token = `mock_jwt_for_${admin.id}`

    return {
      user: admin,
      token,
    }
  }
}
