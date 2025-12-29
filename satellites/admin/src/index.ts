import { type Container, ServiceProvider } from 'gravito-core'
import { CreateRole } from './Application/UseCases/CreateRole'
import { ListAdmins } from './Application/UseCases/ListAdmins'
import { ListPermissions } from './Application/UseCases/ListPermissions'
import { ListRoles } from './Application/UseCases/ListRoles'
import { LoginAdmin } from './Application/UseCases/LoginAdmin'
import { RegisterAdmin } from './Application/UseCases/RegisterAdmin'
import { UpdateAdmin } from './Application/UseCases/UpdateAdmin'
import { AtlasAdminUserRepository } from './Infrastructure/Persistence/AtlasAdminUserRepository'
import { AtlasPermissionRepository } from './Infrastructure/Persistence/AtlasPermissionRepository'
import { AtlasRoleRepository } from './Infrastructure/Persistence/AtlasRoleRepository'
import { AuthController } from './Interface/AuthController'
import { RbacController } from './Interface/RbacController'

export class AdminServiceProvider extends ServiceProvider {
  register(container: Container): void {
    // 注入儲存庫
    container.singleton('admin.repository.user', () => new AtlasAdminUserRepository())
    container.singleton('admin.repository.role', () => new AtlasRoleRepository())
    container.singleton('admin.repository.permission', () => new AtlasPermissionRepository())

    // 注入 Use Cases
    container.bind(
      'admin.usecase.register',
      () => new RegisterAdmin(container.make('admin.repository.user'))
    )
    container.bind(
      'admin.usecase.login',
      () => new LoginAdmin(container.make('admin.repository.user'))
    )
    container.bind(
      'admin.usecase.listAdmins',
      () => new ListAdmins(container.make('admin.repository.user'))
    )
    container.bind(
      'admin.usecase.updateAdmin',
      () => new UpdateAdmin(container.make('admin.repository.user'))
    )
    container.bind(
      'admin.usecase.listRoles',
      () => new ListRoles(container.make('admin.repository.role'))
    )
    container.bind(
      'admin.usecase.createRole',
      () => new CreateRole(container.make('admin.repository.role'))
    )
    container.bind(
      'admin.usecase.listPermissions',
      () => new ListPermissions(container.make('admin.repository.permission'))
    )

    // 注入 Controller
    container.singleton('admin.controller.auth', () => new AuthController(this.core!))
    container.singleton('admin.controller.rbac', () => new RbacController(this.core!))
  }

  override boot(): void {
    const core = this.core
    if (!core) {
      return
    }

    core.logger.info('🏰 Admin Satellite foundation is ready')

    // 註冊管理端 API 路由
    const authController = core.container.make<AuthController>('admin.controller.auth')
    const rbacController = core.container.make<RbacController>('admin.controller.rbac')

    core.router.group({ prefix: '/api/admin/v1' }, (router) => {
      // Auth & User 路由
      router.post('/auth/login', (ctx) => authController.login(ctx))
      router.get('/auth/me', (ctx) => authController.me(ctx))
      router.get('/users', (ctx) => authController.users(ctx))
      router.patch('/users/:id', (ctx) => authController.update(ctx))

      // RBAC 路由
      router.get('/roles', (ctx) => rbacController.index(ctx))
      router.post('/roles', (ctx) => rbacController.store(ctx))
      router.get('/permissions', (ctx) => rbacController.permissions(ctx))
    })
  }
}
