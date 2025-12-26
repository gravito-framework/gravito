---
title: 資料庫測試 (Database Testing)
description: 了解如何在 Gravito 中進行資料庫測試，包含重設資料庫與使用 Factory。
---

# 資料庫測試 (Database Testing)

> Gravito 提供多種工具，確保您的資料庫邏輯在測試中保持正確且可預測。

## 重設資料庫 (Resetting Database)

在每個測試之間重設資料庫狀態至關重要。

### 使用 Migrations

您可以在測試的 `beforeEach` 鉤子中執行 `migrate:fresh`：

```typescript
import { PlanetCore } from '@gravito/core';

describe('User Test', () => {
  beforeEach(async () => {
    const core = await PlanetCore.boot();
    // 透過 CLI 或直接調用 Migrator 進行初始化
    await core.pulse.call('migrate:fresh');
  });
});
```

## 使用 Factory 建立資料 (Factories)

Factory 讓您可以隨機生成大量測試數據。

```typescript
import { UserFactory } from '../database/factories/UserFactory';

it('可以搜尋使用者', async () => {
  // 建立 10 個隨機使用者
  await UserFactory.new().count(10).create();

  const results = await User.where('active', true).get();
  expect(results.length).toBeGreaterThan(0);
});
```

> 了解更多關於 [Model Factories](../database/atlas-factories.md) 的用法。

## 模擬資料庫 (Mocking DB)

在某些情況下，您可能不想觸碰真實資料庫（即使是測試庫）。

### 使用 Memory Driver

在 `gravito.config.ts` 中，您可以為測試環境配置 `sqlite:memory` 或 `memory` 驅動。

```typescript
// gravito.config.ts
export default {
  database: {
    default: process.env.NODE_ENV === 'test' ? 'sqlite' : 'mysql',
    connections: {
      sqlite: {
        driver: 'sqlite',
        database: ':memory:',
      }
    }
  }
}
```

---

## 下一步
了解如何在 [HTTP 測試](../testing.md) 中斷言資料庫變動。
