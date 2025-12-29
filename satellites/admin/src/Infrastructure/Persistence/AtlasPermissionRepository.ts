import type { IPermissionRepository } from '../../Domain/Contracts/IPermissionRepository'
import { Permission } from '../../Domain/Entities/Permission'

export class AtlasPermissionRepository implements IPermissionRepository {
  private static storage = new Map<string, any>()

  async save(entity: Permission): Promise<void> {
    const data = {
      id: entity.id,
      name: entity.name,
      description: entity.description,
    }
    AtlasPermissionRepository.storage.set(entity.id, data)
  }

  async findById(id: string): Promise<Permission | null> {
    const data = AtlasPermissionRepository.storage.get(id)
    return data ? new Permission(data.id, data) : null
  }

  async findByName(name: string): Promise<Permission | null> {
    for (const data of AtlasPermissionRepository.storage.values()) {
      if (data.name === name) return new Permission(data.id, data)
    }
    return null
  }

  async findAll(): Promise<Permission[]> {
    return Array.from(AtlasPermissionRepository.storage.values()).map(
      (d) => new Permission(d.id, d)
    )
  }

  async delete(id: string): Promise<void> {
    AtlasPermissionRepository.storage.delete(id)
  }

  async exists(id: string): Promise<boolean> {
    return AtlasPermissionRepository.storage.has(id)
  }
}
