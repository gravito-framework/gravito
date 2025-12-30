import { UseCase } from '@gravito/enterprise'
import type { IRoleRepository } from '../../Domain/Contracts/IRoleRepository'

export interface UpdateRoleInput {
  id: string
  name?: string
  permissions?: string[]
}

export class UpdateRole extends UseCase<UpdateRoleInput, void> {
  constructor(private repository: IRoleRepository) {
    super()
  }

  async execute(input: UpdateRoleInput): Promise<void> {
    const role = await this.repository.findById(input.id)
    if (!role) {
      throw new Error('Role not found.')
    }

    if (input.name) {
      ;(role as any).props.name = input.name
    }

    if (input.permissions) {
      ;(role as any).props.permissions = input.permissions
    }

    await this.repository.save(role)
  }
}
