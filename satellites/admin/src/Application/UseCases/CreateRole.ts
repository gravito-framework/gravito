import { UseCase } from '@gravito/enterprise'
import type { IRoleRepository } from '../../Domain/Contracts/IRoleRepository'
import { Role } from '../../Domain/Entities/Role'

export interface CreateRoleInput {
  name: string
  permissions?: string[]
}

export class CreateRole extends UseCase<CreateRoleInput, string> {
  constructor(private repository: IRoleRepository) {
    super()
  }

  async execute(input: CreateRoleInput): Promise<string> {
    const existing = await this.repository.findByName(input.name)
    if (existing) throw new Error(`Role "${input.name}" already exists.`)

    const id = crypto.randomUUID()
    const role = Role.create(id, input.name)

    if (input.permissions) {
      for (const p of input.permissions) {
        role.addPermission(p)
      }
    }

    await this.repository.save(role)
    return id
  }
}
