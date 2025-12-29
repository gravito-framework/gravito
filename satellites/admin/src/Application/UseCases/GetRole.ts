import { UseCase } from '@gravito/enterprise'
import type { IRoleRepository } from '../../Domain/Contracts/IRoleRepository'
import type { Role } from '../../Domain/Entities/Role'

export class GetRole extends UseCase<string, Role | null> {
  constructor(private repository: IRoleRepository) {
    super()
  }

  async execute(id: string): Promise<Role | null> {
    return await this.repository.findById(id)
  }
}
