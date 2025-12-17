---
title: Orbit DB
---

# Orbit DB

> 以 Gravito Orbit 形式提供資料庫整合，**完整支援 PostgreSQL 並針對效能進行優化**。

套件：`@gravito/orbit-db`

此 Orbit 整合了 **Drizzle ORM**，提供標準化的資料庫連線、Context 注入、交易支援、查詢輔助方法、健康檢查以及 Hooks。

## 安裝

```bash
bun add @gravito/orbit-db drizzle-orm
```

## 快速開始

### PostgreSQL（推薦）

```typescript
import { PlanetCore } from 'gravito-core';
import orbitDB from '@gravito/orbit-db';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

const core = new PlanetCore();
const client = postgres(process.env.DATABASE_URL);
const db = drizzle(client);

// 初始化 DB Orbit（完整 PostgreSQL 支援）
orbitDB(core, {
  db,
  databaseType: 'postgresql', // 明確指定 PostgreSQL 以獲得最佳效能
  exposeAs: 'db'
});

// 在路由中使用
core.app.get('/users', async (c) => {
  const db = c.get('db'); // DBService 實例
  // 使用查詢輔助方法
  const user = await db.findById(users, 1);
  // 或使用原始 Drizzle 實例
  const allUsers = await db.raw.select().from(users);
  return c.json({ user, allUsers });
});
```

### SQLite

```typescript
import { PlanetCore } from 'gravito-core';
import orbitDB from '@gravito/orbit-db';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { Database } from 'bun:sqlite';

const core = new PlanetCore();
const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite);

orbitDB(core, { 
  db,
  exposeAs: 'db'
});
```

## API 參考

### OrbitDBOptions

```typescript
interface OrbitDBOptions {
  db: any; // Drizzle 資料庫實例
  schema?: Record<string, unknown>;
  exposeAs?: string; // 預設: 'db'
  enableQueryLogging?: boolean; // 預設: false
  queryLogLevel?: 'debug' | 'info' | 'warn' | 'error'; // 預設: 'debug'
  enableHealthCheck?: boolean; // 預設: true
  healthCheckQuery?: string; // 預設: 'SELECT 1' (PostgreSQL 優化)
  databaseType?: 'postgresql' | 'sqlite' | 'mysql' | 'auto'; // 預設: 'auto'
}
```

### DBService 方法

#### `raw`

取得原始 Drizzle 實例（保持向後相容）：

```typescript
const db = c.get('db');
const drizzleDb = db.raw; // 原始 Drizzle 實例
```

#### `transaction<T>(callback: (tx) => Promise<T>): Promise<T>`

執行資料庫交易（完整支援 PostgreSQL 交易特性）：

```typescript
const result = await db.transaction(async (tx) => {
  const user = await tx.insert(users).values({ name: 'John' });
  const profile = await tx.insert(profiles).values({ userId: user.id });
  return { user, profile };
});
```

#### `findById<T>(table, id): Promise<T | null>`

根據 ID 查詢單筆記錄：

```typescript
const user = await db.findById(users, 1);
```

#### `findOne<T>(table, where): Promise<T | null>`

查詢單筆記錄：

```typescript
const user = await db.findOne(users, { email: 'user@example.com' });
```

#### `findAll<T>(table, where?, options?): Promise<T[]>`

查詢所有記錄（可選條件和排序）：

```typescript
// 查詢所有記錄
const allUsers = await db.findAll(users);

// 帶條件查詢
const activeUsers = await db.findAll(users, { status: 'active' });

// 帶排序和限制
const recentUsers = await db.findAll(users, undefined, {
  orderBy: users.createdAt,
  orderDirection: 'desc',
  limit: 10
});
```

#### `count(table, where?): Promise<number>`

計算記錄數：

```typescript
const totalUsers = await db.count(users);
const activeUsersCount = await db.count(users, { status: 'active' });
```

#### `exists(table, where): Promise<boolean>`

檢查記錄是否存在：

```typescript
const userExists = await db.exists(users, { email: 'user@example.com' });
```

#### `findByIdWith<T>(tableName, id, relations): Promise<T | null>`

使用關聯查詢根據 ID 查詢記錄（需要先定義 Drizzle relations）：

```typescript
// 假設已定義 users 和 posts 的關聯
const user = await db.findByIdWith('users', 1, {
  posts: true,           // 載入所有 posts
  profile: true,         // 載入 profile
  posts: {              // 嵌套關聯
    comments: true
  }
});
```

#### `findOneWith<T>(tableName, where, relations): Promise<T | null>`

使用關聯查詢單筆記錄：

```typescript
const user = await db.findOneWith('users', { email: 'john@example.com' }, {
  posts: true,
  profile: true
});
```

#### `findAllWith<T>(tableName, relations, options?): Promise<T[]>`

使用關聯查詢所有記錄：

```typescript
const users = await db.findAllWith('users', { posts: true }, {
  where: { status: 'active' },
  limit: 10
});
```

**注意**：關聯查詢方法使用 Drizzle 的 `query` API，需要先定義 relations。如果沒有定義 relations，可以使用 `db.raw.query` 直接存取。

#### `paginate<T>(table, options): Promise<PaginateResult<T>>`

分頁查詢（針對 PostgreSQL 優化，使用 `LIMIT/OFFSET`）：

```typescript
const result = await db.paginate(users, {
  page: 1,
  limit: 10,
  orderBy: users.createdAt,
  orderDirection: 'desc'
});

// result.data - 資料陣列
// result.pagination - 分頁資訊
//   - page: 當前頁碼
//   - limit: 每頁數量
//   - total: 總記錄數
//   - totalPages: 總頁數
//   - hasNext: 是否有下一頁
//   - hasPrev: 是否有上一頁
```

#### `healthCheck(): Promise<HealthCheckResult>`

檢查資料庫連線健康狀態（PostgreSQL 使用最輕量級的 `SELECT 1` 查詢）：

```typescript
const health = await db.healthCheck();
// { status: 'healthy' | 'unhealthy', latency?: number, error?: string }
```

#### `migrate(): Promise<MigrateResult>`

執行所有待處理的資料庫遷移：

```typescript
const result = await db.migrate();
// { success: boolean, appliedMigrations?: string[], error?: string }
```

#### `migrateTo(targetMigration?: string): Promise<MigrateResult>`

遷移到指定的遷移版本：

```typescript
const result = await db.migrateTo('001_initial');
// { success: boolean, appliedMigrations?: string[], error?: string }
```

#### `seed(seedFunction: SeedFunction, seedName?: string): Promise<SeedResult>`

執行 seed 資料：

```typescript
const seedFunction = async (db) => {
  await db.insert(users).values([
    { name: 'John', email: 'john@example.com' },
    { name: 'Jane', email: 'jane@example.com' },
  ]);
};

const result = await db.seed(seedFunction, 'users-seed');
// { success: boolean, seededFiles?: string[], error?: string }
```

#### `seedMany(seedFunctions: Array<{ name: string; seed: SeedFunction }>): Promise<SeedResult>`

執行多個 seed 函數：

```typescript
const result = await db.seedMany([
  { name: 'users-seed', seed: usersSeedFunction },
  { name: 'posts-seed', seed: postsSeedFunction },
]);
// { success: boolean, seededFiles?: string[], error?: string }
```

#### `create<T>(table, data): Promise<T>`

創建單筆記錄：

```typescript
const newUser = await db.create(users, {
  name: 'John',
  email: 'john@example.com'
});
```

#### `insert<T>(table, data): Promise<T | T[]>`

插入記錄（支援單筆或多筆）：

```typescript
// 單筆插入
const user = await db.insert(users, { name: 'John', email: 'john@example.com' });

// 多筆插入
const users = await db.insert(users, [
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' }
]);
```

#### `update<T>(table, where, data): Promise<T[]>`

更新記錄：

```typescript
const updatedUsers = await db.update(users, { id: 1 }, { name: 'John Updated' });
```

#### `delete(table, where): Promise<void>`

刪除記錄：

```typescript
await db.delete(users, { id: 1 });
```

#### `bulkInsert<T>(table, data): Promise<T[]>`

批量插入：

```typescript
const newUsers = await db.bulkInsert(users, [
  { name: 'John', email: 'john@example.com' },
  { name: 'Jane', email: 'jane@example.com' },
  { name: 'Bob', email: 'bob@example.com' }
]);
```

#### `bulkUpdate<T>(table, updates): Promise<T[]>`

批量更新（在交易中執行）：

```typescript
const updatedUsers = await db.bulkUpdate(users, [
  { where: { id: 1 }, data: { name: 'John Updated' } },
  { where: { id: 2 }, data: { name: 'Jane Updated' } }
]);
```

#### `bulkDelete(table, whereConditions): Promise<void>`

批量刪除（在交易中執行）：

```typescript
await db.bulkDelete(users, [
  { id: 1 },
  { id: 2 },
  { id: 3 }
]);
```

#### `deploy(options?: DeployOptions): Promise<DeployResult>`

部署資料庫（執行遷移和 seed，適合生產環境部署）：

```typescript
const result = await db.deploy({
  runMigrations: true,      // 執行遷移（預設: true）
  runSeeds: false,          // 執行 seed（預設: false）
  skipHealthCheck: false,   // 跳過健康檢查（預設: false）
  validateBeforeDeploy: true, // 部署前驗證（預設: true）
});
// { success: boolean, migrations?: MigrateResult, seeds?: SeedResult, healthCheck?: HealthCheckResult, error?: string }
```

## Hooks

### `db:connected`

當 DB Orbit 成功註冊時觸發：

```typescript
core.hooks.addAction('db:connected', ({ db, dbService, databaseType }) => {
  console.log(`Database connected: ${databaseType}`);
});
```

### `db:query`

每次查詢執行時觸發（需啟用查詢日誌）：

```typescript
core.hooks.addAction('db:query', ({ query, params, duration, timestamp }) => {
  console.log(`Query: ${query}, Duration: ${duration}ms`);
});
```

### `db:transaction:start`

交易開始時觸發：

```typescript
core.hooks.addAction('db:transaction:start', ({ transactionId, startTime }) => {
  console.log(`Transaction started: ${transactionId}`);
});
```

### `db:transaction:commit`

交易提交時觸發：

```typescript
core.hooks.addAction('db:transaction:commit', ({ transactionId, duration }) => {
  console.log(`Transaction committed: ${transactionId} (${duration}ms)`);
});
```

### `db:transaction:rollback`

交易回滾時觸發：

```typescript
core.hooks.addAction('db:transaction:rollback', ({ transactionId, duration }) => {
  console.log(`Transaction rolled back: ${transactionId} (${duration}ms)`);
});
```

### `db:transaction:error`

交易錯誤時觸發：

```typescript
core.hooks.addAction('db:transaction:error', ({ transactionId, error, duration }) => {
  console.error(`Transaction error: ${transactionId}`, error);
});
```

### `db:health-check`

健康檢查時觸發：

```typescript
core.hooks.addAction('db:health-check', ({ status, latency, error }) => {
  console.log(`Health check: ${status}, Latency: ${latency}ms`);
});
```

### `db:migrate:start`

遷移開始時觸發：

```typescript
core.hooks.addAction('db:migrate:start', ({ targetMigration, timestamp }) => {
  console.log(`Migration started${targetMigration ? ` to ${targetMigration}` : ''}`);
});
```

### `db:migrate:complete`

遷移完成時觸發：

```typescript
core.hooks.addAction('db:migrate:complete', ({ targetMigration, appliedMigrations, duration, timestamp }) => {
  console.log(`Migration completed: ${appliedMigrations.length} migrations applied`);
});
```

### `db:migrate:error`

遷移錯誤時觸發：

```typescript
core.hooks.addAction('db:migrate:error', ({ targetMigration, error, duration, timestamp }) => {
  console.error(`Migration failed${targetMigration ? ` to ${targetMigration}` : ''}`, error);
});
```

### `db:seed:start`

Seed 開始時觸發：

```typescript
core.hooks.addAction('db:seed:start', ({ seedName, seedCount, timestamp }) => {
  console.log(`Seed started: ${seedName || `${seedCount} seeds`}`);
});
```

### `db:seed:complete`

Seed 完成時觸發：

```typescript
core.hooks.addAction('db:seed:complete', ({ seedName, seededFiles, duration, timestamp }) => {
  console.log(`Seed completed: ${seedName || seededFiles?.join(', ')}`);
});
```

### `db:seed:error`

Seed 錯誤時觸發：

```typescript
core.hooks.addAction('db:seed:error', ({ seedName, error, errors, duration, timestamp }) => {
  console.error(`Seed failed: ${seedName || 'multiple seeds'}`, error || errors);
});
```

### `db:deploy:start`

部署開始時觸發：

```typescript
core.hooks.addAction('db:deploy:start', ({ options, timestamp }) => {
  console.log('Database deployment started');
});
```

### `db:deploy:complete`

部署完成時觸發：

```typescript
core.hooks.addAction('db:deploy:complete', ({ migrateResult, seedResult, healthCheckResult, duration, timestamp }) => {
  console.log('Database deployment completed successfully');
});
```

### `db:deploy:error`

部署錯誤時觸發：

```typescript
core.hooks.addAction('db:deploy:error', ({ error, duration, timestamp }) => {
  console.error('Database deployment failed', error);
});
```

## PostgreSQL 效能優化

所有功能都針對 PostgreSQL 進行了效能優化：

- **交易支援**：完整支援 PostgreSQL 交易特性（SAVEPOINT、ROLLBACK TO SAVEPOINT 等）
- **分頁查詢**：使用 PostgreSQL 標準的 `LIMIT/OFFSET` 語法
- **健康檢查**：使用最輕量級的 `SELECT 1` 查詢
- **查詢日誌**：非同步記錄，不阻塞查詢執行

## 進階用法

### 啟用查詢日誌

```typescript
orbitDB(core, {
  db,
  enableQueryLogging: true,
  queryLogLevel: 'info' // 'debug' | 'info' | 'warn' | 'error'
});
```

### 自訂健康檢查查詢

```typescript
orbitDB(core, {
  db,
  healthCheckQuery: 'SELECT 1 FROM pg_stat_activity LIMIT 1' // PostgreSQL 特定查詢
});
```

### 使用自訂 exposeAs

```typescript
orbitDB(core, {
  db,
  exposeAs: 'database' // 透過 c.get('database') 存取
});
```

## 關聯查詢（Relations）

Drizzle ORM 支援強大的關聯查詢功能。要使用關聯查詢，需要先定義 relations：

### 定義 Relations

```typescript
import { relations } from 'drizzle-orm';
import { pgTable, integer, text } from 'drizzle-orm/pg-core';

const users = pgTable('users', {
  id: integer('id').primaryKey(),
  name: text('name'),
});

const posts = pgTable('posts', {
  id: integer('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  title: text('title'),
});

// 定義 relations
const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

const postsRelations = relations(posts, ({ one }) => ({
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));

// 建立 Drizzle 實例時包含 relations
const db = drizzle(client, { schema: { users, posts, usersRelations, postsRelations } });
```

### 使用關聯查詢

```typescript
// 查詢用戶及其所有文章
const user = await db.findByIdWith('users', 1, { posts: true });

// 嵌套關聯
const user = await db.findByIdWith('users', 1, {
  posts: {
    comments: true  // 載入 posts 的 comments
  }
});

// 或直接使用 Drizzle 的 query API
const user = await db.raw.query.users.findFirst({
  where: eq(users.id, 1),
  with: { posts: true }
});
```

## 完整使用指南

詳細的 ORM 使用指南，包含完整範例、最佳實踐和進階用法，請參考：

- [ORM 使用指南（中文）](../guide/orm-usage.md)
- [ORM Usage Guide (English)](../en/guide/orm-usage.md)

使用指南涵蓋：
- 基本設置和配置
- Schema 和 Relations 定義
- 完整的 CRUD 操作範例
- 關聯查詢詳細說明
- 交易處理最佳實踐
- 批量操作使用方式
- 遷移和 Seeder 完整流程
- 生產環境部署指南
- 效能優化建議
