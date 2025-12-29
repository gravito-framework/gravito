import { UseCase } from '@gravito/enterprise'
import type { IAdminUserRepository } from '../../Domain/Contracts/IAdminUserRepository'

export interface UpdateAdminInput {
  id: string
  roles?: string[]
  isActive?: boolean
}

export class UpdateAdmin extends UseCase<UpdateAdminInput, void> {
  constructor(private repository: IAdminUserRepository) {
    super()
  }

  async execute(input: UpdateAdminInput): Promise<void> {
    const admin = await this.repository.findById(input.id)
    if (!admin) {
      throw new Error('Admin user not found.')
    }

    if (input.isActive !== undefined) {
      ;(admin as any).props.isActive = input.isActive
    }

    if (input.roles) {
      ;(admin as any).props.roles = input.roles
    }

    await this.repository.save(admin)
  }
}
