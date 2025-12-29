import { Entity } from '@gravito/enterprise'

export interface RoleProps {
  name: string
  permissions: string[] // List of permission IDs
}

export class Role extends Entity<string> {
  constructor(
    id: string,
    private props: RoleProps
  ) {
    super(id)
  }

  static create(id: string, name: string): Role {
    return new Role(id, {
      name,
      permissions: [],
    })
  }

  addPermission(permissionId: string): void {
    if (!this.props.permissions.includes(permissionId)) {
      this.props.permissions.push(permissionId)
    }
  }

  removePermission(permissionId: string): void {
    this.props.permissions = this.props.permissions.filter((id) => id !== permissionId)
  }

  get name() {
    return this.props.name
  }
  get permissions() {
    return [...this.props.permissions]
  }
}
