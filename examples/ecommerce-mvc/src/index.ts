import { OrbitMonolith, Route } from '@gravito/monolith'
import { OrbitPhoton } from '@gravito/photon'
import { PlanetCore } from 'gravito-core'
import { ProductController } from './controllers/ProductController'
import { StoreProductRequest } from './requests/StoreProductRequest'

const core = new PlanetCore()

// 1. 註冊核心軌道
await core.orbit(new OrbitPhoton({ port: 3000 }))
await core.orbit(new OrbitMonolith())

// 2. 定義路由
const router = core.adapter

router.get('/', (c) => c.text('Welcome to Gravito E-Commerce! 🌌'))

// 手動註冊帶驗證的 Store 路由
router.post('/products', StoreProductRequest.middleware(), ProductController.call('store'))

// 註冊其餘資源路由
Route.resource(router, 'products', ProductController)

// 3. 升空
await core.liftoff()
