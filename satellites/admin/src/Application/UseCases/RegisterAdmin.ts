import { UseCase } from '@gravito/enterprise'
import type { IAdminUserRepository } from '../../Domain/Contracts/IAdminUserRepository'
import { AdminUser } from '../../Domain/Entities/AdminUser'

export interface RegisterAdminInput {
  username: string
  email: string
  passwordRaw: string // 這裡在實作時會透過 Hasher 加密
}

export class RegisterAdmin extends UseCase<RegisterAdminInput, string> {
  constructor(private repository: IAdminUserRepository) {
    super()
  }

  async execute(input: RegisterAdminInput): Promise<string> {
    const existing = await this.repository.findByEmail(input.email)
    if (existing) throw new Error('Admin user already exists.')

    const id = crypto.randomUUID()

    // 註：在真實場景中會注入 Hasher
    const admin = AdminUser.create(id, {
      username: input.username,
      email: input.email,
      passwordHash: `hashed_${input.passwordRaw}`,
    })

    await this.repository.save(admin)
    return id
  }
}
