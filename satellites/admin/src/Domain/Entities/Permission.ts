import { Entity } from '@gravito/enterprise'

export interface PermissionProps {
  name: string
  description?: string
}

export class Permission extends Entity<string> {
  constructor(
    id: string,
    private props: PermissionProps
  ) {
    super(id)
  }

  static create(id: string, props: PermissionProps): Permission {
    return new Permission(id, props)
  }

  get name() {
    return this.props.name
  }
  get description() {
    return this.props.description
  }
}
