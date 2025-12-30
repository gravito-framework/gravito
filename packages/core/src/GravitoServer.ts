import { OrbitMonolith } from '@gravito/monolith'
import { PhotonAdapter } from './adapters/PhotonAdapter'
import { type GravitoConfig, PlanetCore } from './PlanetCore'
import { ServiceProvider } from './ServiceProvider'

export interface GravitoManifest {
  name: string
  version?: string
  modules: string[]
  config?: GravitoConfig
}

export type ModuleResolver = () => Promise<any>

/**
 * Gravito 核心啟動引擎
 */
export class GravitoServer {
  /**
   * 一鍵建立並組裝伺服器
   * @param manifest 站點描述清單
   * @param resolvers 模組解析器字典 (讓應用層決定如何加載套件)
   */
  static async create(
    manifest: GravitoManifest,
    resolvers: Record<string, ModuleResolver>
  ): Promise<PlanetCore> {
    const core = new PlanetCore(
      manifest.config || {
        adapter: new PhotonAdapter(),
        providers: [OrbitMonolith],
      }
    )

    console.log(`
🌌 [Gravito Core] 正在點燃: ${manifest.name} v${manifest.version || '1.0.0'}`)

    for (const moduleId of manifest.modules) {
      const resolver = resolvers[moduleId]
      if (!resolver) {
        console.warn(`   ⚠️ 找不到模組 ID [${moduleId}] 的解析器，跳過。`)
        continue
      }

      try {
        const exported = await resolver()
        // 如果是 class (ServiceProvider)，則實例化它
        // 如果已經是實例，則直接註冊
        let instance: ServiceProvider

        if (typeof exported === 'function' && exported.prototype instanceof ServiceProvider) {
          instance = new exported()
        } else if (exported instanceof ServiceProvider) {
          instance = exported
        } else {
          console.error(`   ❌ 模組 [${moduleId}] 解析出的結果不是有效的 ServiceProvider。`)
          continue
        }

        core.register(instance)
        console.log(`   ✅ 模組點火成功: [${moduleId}]`)
      } catch (error: any) {
        console.error(`   ❌ 模組 [${moduleId}] 點火失敗: ${error.message}`)
      }
    }

    return core
  }
}
