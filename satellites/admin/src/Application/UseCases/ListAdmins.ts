import { UseCase } from '@gravito/enterprise'
import type { IAdminUserRepository } from '../../Domain/Contracts/IAdminUserRepository'
import type { AdminUser } from '../../Domain/Entities/AdminUser'

export class ListAdmins extends UseCase<void, AdminUser[]> {
  constructor(private repository: IAdminUserRepository) {
    super()
  }

  async execute(): Promise<AdminUser[]> {
    return await this.repository.findAll()
  }
}
