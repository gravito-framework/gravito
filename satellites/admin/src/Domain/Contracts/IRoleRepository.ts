import type { Repository } from '@gravito/enterprise'
import type { Role } from '../Entities/Role'

export interface IRoleRepository extends Repository<Role, string> {
  findByName(name: string): Promise<Role | null>
}
