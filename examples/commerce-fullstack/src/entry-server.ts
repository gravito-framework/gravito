import { GravitoServer } from 'gravito-core'
import manifest from './config/gravito.config'

/**
 * 為了確保 Monorepo 下模組能正確被解析，我們在這裡定義對應關係
 * 這依然保持了極簡：只是將 ID 與對應的 ServiceProvider 類別連結
 */
const app = await GravitoServer.create(manifest, {
  catalog: () => import('@gravito/satellite-catalog').then((m) => m.CatalogServiceProvider),
  membership: () =>
    import('@gravito/satellite-membership').then((m) => m.MembershipServiceProvider),
  analytics: () => import('@gravito/satellite-analytics').then((m) => m.AnalyticsServiceProvider),
  cms: () => import('@gravito/satellite-announcement').then((m) => m.AnnouncementServiceProvider),
  support: () => import('@gravito/satellite-support').then((m) => m.SupportServiceProvider()),
})

app.liftoff(3000)
