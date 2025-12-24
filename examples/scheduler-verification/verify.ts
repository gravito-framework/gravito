/**
 * 驗證腳本：模擬自動擴展環境下的多個實例競爭
 */
import { spawn } from 'node:child_process'

console.log('--- 開始排程分散式驗證 ---')
console.log('模擬啟動兩個 Worker 實例...')

const startWorker = (name: string, role: string) => {
    const p = spawn('bun', ['run', 'src/index.ts'], {
        env: { ...process.env, INSTANCE_NAME: name, NODE_ROLE: role }
    })

    p.stdout.on('data', (data) => {
        process.stdout.write(data.toString())
    })

    p.stderr.on('data', (data) => {
        process.stderr.write(`[${name} ERROR] ${data}`)
    })

    return p
}

// 實例 1: 角色為 worker
const worker1 = startWorker('Instance-A', 'worker')

// 實例 2: 角色同樣為 worker (測試爭搶鎖)
const worker2 = startWorker('Instance-B', 'worker')

// 實例 3: 角色為 admin (測試任務過濾)
const admin = startWorker('Instance-Admin', 'admin')

process.on('SIGINT', () => {
    worker1.kill()
    worker2.kill()
    admin.kill()
    process.exit()
})

console.log('驗證重點：')
console.log('1. [Instance-A] 或 [Instance-B] 只有其中一個會執行 "critical-data-sync"。')
console.log('2. 兩者皆會執行 "system-heartbeat"。')
console.log('3. 只有 [Instance-Admin] 會執行 "admin-report"。')
