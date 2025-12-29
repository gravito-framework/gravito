import { UseCase } from '@gravito/enterprise'
import type { IPermissionRepository } from '../../Domain/Contracts/IPermissionRepository'
import type { Permission } from '../../Domain/Entities/Permission'

export class ListPermissions extends UseCase<void, Permission[]> {
  constructor(private repository: IPermissionRepository) {
    super()
  }

  async execute(): Promise<Permission[]> {
    return await this.repository.findAll()
  }
}
