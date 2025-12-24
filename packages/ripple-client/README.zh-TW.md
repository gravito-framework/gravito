# @gravito/ripple-client

> @gravito/ripple 的前端 WebSocket 用戶端，支援 React、Vue 與原生 JS。

## 安裝

```bash
bun add @gravito/ripple-client
```

## 快速開始

```typescript
import { createRippleClient } from '@gravito/ripple-client'

const client = createRippleClient({
  host: 'ws://localhost:3000/ws',
  authEndpoint: '/broadcasting/auth',
})

await client.connect()

client.channel('news')
  .listen('ArticlePublished', (data) => {
    console.log('New article:', data.title)
  })
```
