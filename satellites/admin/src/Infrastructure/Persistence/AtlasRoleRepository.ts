import type { IRoleRepository } from '../../Domain/Contracts/IRoleRepository'
import { Role } from '../../Domain/Entities/Role'

export class AtlasRoleRepository implements IRoleRepository {
  private static storage = new Map<string, any>()

  async save(entity: Role): Promise<void> {
    const data = {
      id: entity.id,
      name: entity.name,
      permissions: entity.permissions,
    }
    AtlasRoleRepository.storage.set(entity.id, data)
  }

  async findById(id: string): Promise<Role | null> {
    const data = AtlasRoleRepository.storage.get(id)
    return data ? new Role(data.id, data) : null
  }

  async findByName(name: string): Promise<Role | null> {
    for (const data of AtlasRoleRepository.storage.values()) {
      if (data.name === name) return new Role(data.id, data)
    }
    return null
  }

  async findAll(): Promise<Role[]> {
    return Array.from(AtlasRoleRepository.storage.values()).map((d) => new Role(d.id, d))
  }

  async delete(id: string): Promise<void> {
    AtlasRoleRepository.storage.delete(id)
  }

  async exists(id: string): Promise<boolean> {
    return AtlasRoleRepository.storage.has(id)
  }
}
