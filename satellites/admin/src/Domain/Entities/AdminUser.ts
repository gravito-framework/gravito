import { Entity } from '@gravito/enterprise'

export interface AdminUserProps {
  username: string
  email: string
  passwordHash: string
  roles: string[] // List of role IDs
  isActive: boolean
  lastLoginAt?: Date
}

export class AdminUser extends Entity<string> {
  constructor(
    id: string,
    private props: AdminUserProps
  ) {
    super(id)
  }

  static create(id: string, props: Omit<AdminUserProps, 'isActive' | 'roles'>): AdminUser {
    return new AdminUser(id, {
      ...props,
      roles: [],
      isActive: true,
    })
  }

  assignRole(roleId: string): void {
    if (!this.props.roles.includes(roleId)) {
      this.props.roles.push(roleId)
    }
  }

  get username() {
    return this.props.username
  }
  get email() {
    return this.props.email
  }
  get roles() {
    return [...this.props.roles]
  }
  get isActive() {
    return this.props.isActive
  }
}
