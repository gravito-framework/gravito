import { createLaunchpadServer } from './src/index'

const server = createLaunchpadServer()
console.log(`🚀 Launchpad Command Center active at: ${server.url}`)
console.log(`📡 Telemetry WebSocket channel: ws://${server.hostname}:${server.port}`)

// 模擬外部調用 Warmup (因為 server 內部封裝了 pool，我們應該在 server 內部暴露 warmup 方法，
// 但為了不改動太多架構，我們假設第一次請求會自動觸發動態創建，或者我們修改 index.ts 導出 manager)
//
// 更好的做法：我們在 index.ts 的 createLaunchpadServer 返回的不只是 server 實例，還有 manager。
