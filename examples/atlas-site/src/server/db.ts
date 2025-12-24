import { DB } from '@gravito/atlas'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.resolve(__dirname, '../../.atlas/database.sqlite')

// Ensure directory exists
import fs from 'fs'
const dir = path.dirname(dbPath)
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
}

DB.configure({
    default: 'sqlite',
    connections: {
        sqlite: {
            driver: 'sqlite',
            database: dbPath,
        },
        redis: {
            driver: 'redis',
            host: '127.0.0.1',
            port: 6379,
        },
        mongodb: {
            driver: 'mongodb',
            uri: 'mongodb://localhost:27017',
            database: 'atlas_test'
        }
    }
})

export { DB }
