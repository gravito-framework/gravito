import { UseCase } from '@gravito/enterprise'
import type { IRoleRepository } from '../../Domain/Contracts/IRoleRepository'
import type { Role } from '../../Domain/Entities/Role'

export class ListRoles extends UseCase<void, Role[]> {
  constructor(private repository: IRoleRepository) {
    super()
  }

  async execute(): Promise<Role[]> {
    return await this.repository.findAll()
  }
}
