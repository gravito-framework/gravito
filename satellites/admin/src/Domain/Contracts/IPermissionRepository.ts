import type { Repository } from '@gravito/enterprise'
import type { Permission } from '../Entities/Permission'

export interface IPermissionRepository extends Repository<Permission, string> {
  findByName(name: string): Promise<Permission | null>
}
