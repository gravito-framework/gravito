# 數據填充 (Seeding)

Atlas 包含了使用 Seed 類別為資料庫填充測試數據的功能。

## 撰寫 Seeders

Seeders 儲存在 `database/seeders` 目錄中。一個 Seeder 類別包含一個 `run` 方法，您可以在其中向資料庫插入數據。

```typescript
import { Seeder } from '@gravito/atlas';
import User from '../src/models/User';

export default class DatabaseSeeder extends Seeder {
  async run() {
    await User.query().insert({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'password'
    });
  }
}
```

## 使用模型工廠 (Using Model Factories)

除了手動插入數據，您也可以使用 [模型工廠 (Factories)](./atlas-factories) 來快速生成大量測試數據。

```typescript
import { Factory } from '@gravito/atlas';
import User from '../src/models/User';

export default class UserSeeder extends Seeder {
  async run() {
    // 使用工廠建立 10 個使用者
    await Factory.model(User).count(10).create();
  }
}
```

> 詳細的工廠定義與用法，請參考 [模型工廠文檔](./atlas-factories)。

## 調用其他 Seeders

在 Seeder 的 `run` 方法中，您可以使用 `call` 方法來執行其他的 Seed 類別。這讓您可以將資料庫填充拆分為多個檔案，避免單一 Seeder 檔案過大：

```typescript
export default class DatabaseSeeder extends Seeder {
  async run() {
    await this.call([
      UserSeeder,
      PostSeeder,
      CommentSeeder,
    ]);
  }
}
```

## 執行 Seeders

要填充資料庫，請執行 `db:seed` Orbit 命令：

```bash
bun orbit db:seed
```

您也可以指定特定的 Seeder 類別執行：

```bash
bun orbit db:seed --class=UserSeeder
```

## 生產環境警告

預設情況下，如果您嘗試在 `production`（生產）環境中執行 Seeder，系統會發出警告，因為這可能會覆蓋真實數據。若要強制執行，請使用 `--force` 標誌：

```bash
bun orbit db:seed --force
```