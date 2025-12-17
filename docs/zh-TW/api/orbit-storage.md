---
title: Orbit Storage
---

# Orbit Storage

> 以 Gravito Orbit 形式提供檔案儲存抽象層。

套件：`@gravito/orbit-storage`

提供檔案儲存的抽象層，內建本地磁碟提供者 (Local Disk Provider)。

## 安裝

```bash
bun add @gravito/orbit-storage
```

## 用法

```typescript
import { PlanetCore } from 'gravito-core';
import orbitStorage from '@gravito/orbit-storage';

const core = new PlanetCore();

// 初始化 Storage Orbit (本地)
const storage = orbitStorage(core, {
  local: {
    root: './uploads',
    baseUrl: '/uploads'
  },
  exposeAs: 'storage' // 可透過 c.get('storage') 存取
});

// 在路由中使用
core.app.post('/upload', async (c) => {
  const body = await c.req.parseBody();
  const file = body['file'];
  
  if (file instanceof File) {
    await storage.put(file.name, file);
    return c.json({ url: storage.getUrl(file.name) });
  }
  return c.text('No file uploaded', 400);
});
```

## Hooks

- `storage:init` - 當模組初始化時觸發。
- `storage:upload` - (Filter) 上傳前修改資料。
- `storage:uploaded` - (Action) 上傳成功後觸發。
