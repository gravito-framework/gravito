import type { IAdminUserRepository } from '../../Domain/Contracts/IAdminUserRepository'
import { AdminUser } from '../../Domain/Entities/AdminUser'

export class AtlasAdminUserRepository implements IAdminUserRepository {
  private static storage = new Map<string, any>()

  async save(entity: AdminUser): Promise<void> {
    const data = {
      id: entity.id,
      username: entity.username,
      email: entity.email,
      roles: entity.roles,
      isActive: entity.isActive,
      passwordHash: (entity as any).props.passwordHash,
    }
    AtlasAdminUserRepository.storage.set(entity.id, data)
  }

  async findById(id: string): Promise<AdminUser | null> {
    const data = AtlasAdminUserRepository.storage.get(id)
    return data ? new AdminUser(data.id, data) : null
  }

  async findByEmail(email: string): Promise<AdminUser | null> {
    for (const data of AtlasAdminUserRepository.storage.values()) {
      if (data.email === email) {
        return new AdminUser(data.id, data)
      }
    }
    return null
  }

  async findByUsername(username: string): Promise<AdminUser | null> {
    for (const data of AtlasAdminUserRepository.storage.values()) {
      if (data.username === username) {
        return new AdminUser(data.id, data)
      }
    }
    return null
  }

  async findAll(): Promise<AdminUser[]> {
    return Array.from(AtlasAdminUserRepository.storage.values()).map((d) => new AdminUser(d.id, d))
  }

  async delete(id: string): Promise<void> {
    AtlasAdminUserRepository.storage.delete(id)
  }

  async exists(id: string): Promise<boolean> {
    return AtlasAdminUserRepository.storage.has(id)
  }
}
