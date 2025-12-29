import { UseCase } from '@gravito/enterprise'
import type { IRoleRepository } from '../../Domain/Contracts/IRoleRepository'

export class DeleteRole extends UseCase<string, void> {
  constructor(private repository: IRoleRepository) {
    super()
  }

  async execute(id: string): Promise<void> {
    const role = await this.repository.findById(id)
    if (!role) {
      throw new Error('Role not found.')
    }

    // 防呆：禁止刪除內建的超級管理員角色 (假設名稱為超級管理員或 ID 固定)
    if (role.name === '超級管理員' || role.permissions.includes('*')) {
      throw new Error('Cannot delete protected system role.')
    }

    await this.repository.delete(id)
  }
}
