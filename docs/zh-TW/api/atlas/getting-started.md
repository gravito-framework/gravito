---
title: 快速上手
---

# 快速上手

> 安裝 Atlas 並配置資料庫連接。Atlas 提供了一個與 Laravel 相似且流暢的查詢構造器（Query Builder）。

## 安裝

```bash
bun add @gravito/atlas
```

## 配置與初始化

您可以使用 `DB.configure` 或 `DB.addConnection` 來初始化資料庫連接。通常在應用程式啟動時（例如 `bootstrap.ts`）進行配置。

### 基本配置

```ts
import { DB } from '@gravito/atlas'

DB.configure({
  default: 'postgres',
  connections: {
    postgres: {
      driver: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'gravito_app',
      username: 'postgres',
      password: 'password',
    }
  }
})
```

### 資料庫類型支援

Atlas 目前支援以下驅動程式：
- `postgres` (基於 `pg`)
- `mysql` (基於 `mysql2`)
- `sqlite` (基於 `better-sqlite3`)
- `mongodb` (基於 `mongodb`)
- `redis` (基於 `ioredis`)

## 多資料庫連接 (Multi-database)

Atlas 支援同時管理多個資料庫連接，甚至是不同類型的資料庫。

```ts
DB.configure({
  default: 'main',
  connections: {
    main: {
      driver: 'postgres',
      host: 'localhost',
      database: 'main_db'
    },
    analytics: {
      driver: 'mysql',
      host: 'remote-host',
      database: 'logs'
    },
    local_cache: {
      driver: 'sqlite',
      database: 'cache.sqlite'
    }
  }
})

// 使用預設連接 (main)
const users = await DB.table('users').get()

// 指定使用 analytics 連接
const logs = await DB.connection('analytics').table('logs').get()
```

## 基本使用

配置完成後，即可在應用的任何地方透過 `DB` 門面存取資料庫。

```ts
import { DB } from '@gravito/atlas'

// 查詢
const activeUsers = await DB.table('users')
  .where('status', 'active')
  .get()

// 插入
await DB.table('users').insert({
  name: 'John Doe',
  email: 'john@example.com'
})

// 交易
await DB.transaction(async (trx) => {
  await trx.table('accounts').where('id', 1).decrement('balance', 100)
  await trx.table('accounts').where('id', 2).increment('balance', 100)
})
```
