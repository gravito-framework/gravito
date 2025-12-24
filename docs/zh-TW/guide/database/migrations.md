# 資料庫遷移 (Migrations)

遷移 (Migrations) 就像是資料庫的版本控制，讓您的團隊能夠定義並共享應用程式的資料庫架構定義。如果您曾經必須告訴隊友手動在他們的本地資料庫中新增欄位，那麼您就遇過遷移所要解決的問題。

## 簡介

Gravito 透過 `Pulse` CLI 與 `Atlas` ORM 提供了強大的遷移系統。遷移檔案通常存放在 `database/migrations` 目錄中。

## 產生遷移

要建立一個新的遷移，請使用 Pulse 的 `make:migration` 指令。

```bash
bun pulse make:migration create_users_table
```

這將會在 `database/migrations` 中建立一個帶有時間戳前綴的新檔案，確保它們能依照正確的順序執行。

## 遷移結構

一個遷移類別包含兩個方法：`up` 與 `down`。`up` 方法用於在資料庫中新增資料表、欄位或索引，而 `down` 方法則應反轉 `up` 方法所執行的操作。

```typescript
import { Migration, Schema, Blueprint } from '@gravito/atlas';

export default class CreateUsersTable extends Migration {
  /**
   * 執行遷移
   */
  public async up(): Promise<void> {
    await Schema.create('users', (table: Blueprint) => {
      table.id();
      table.string('name');
      table.string('email').unique();
      table.string('password');
      table.timestamps(); // 建立 createdAt 與 updatedAt
    });
  }

  /**
   * 回滾遷移
   */
  public async down(): Promise<void> {
    await Schema.dropIfExists('users');
  }
}
```

::: warning MongoDB 注意事項
由於 MongoDB 是無 Schema (Schema-less) 的，遷移通常用於資料轉換或建立索引，而非定義嚴格的資料表結構。不過，如果驅動程式支援，`Schema.create` 仍可用於設定初始驗證規則或索引。
:::

## 執行遷移

要執行所有尚未執行的遷移，請執行 `migrate` 指令：

```bash
bun pulse migrate
```

## 回滾遷移

要回滾最後一次的遷移操作：

```bash
bun pulse migrate:rollback
```

要重置資料庫（回滾所有遷移）：

```bash
bun pulse migrate:reset
```

要刷新資料庫（回滾所有並重新執行，對開發非常有用）：

```bash
bun pulse migrate:refresh
```
