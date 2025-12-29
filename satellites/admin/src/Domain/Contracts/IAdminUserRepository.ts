import type { Repository } from '@gravito/enterprise'
import type { AdminUser } from '../Entities/AdminUser'

export interface IAdminUserRepository extends Repository<AdminUser, string> {
  findByEmail(email: string): Promise<AdminUser | null>
  findByUsername(username: string): Promise<AdminUser | null>
}
