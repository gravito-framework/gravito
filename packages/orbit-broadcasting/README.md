# @gravito/orbit-broadcasting

輕量、高效的廣播系統，支援多種驅動（Pusher、Ably、Redis、WebSocket）。借鑑 Laravel 架構但保持 Gravito 的核心價值（高效能、低耗、輕量、AI 友善）。

> **狀態**：v0.1.0 - 核心功能已完成，支援多種廣播驅動

## 特性

- **零運行時開銷**：純類型包裝，直接委派給驅動
- **多驅動支援**：Pusher、Ably、Redis、WebSocket
- **完全模組化**：按需安裝驅動，核心包極小
- **與 Events 整合**：事件可實作 `ShouldBroadcast` 自動廣播
- **頻道授權**：支援私有頻道和存在頻道授權
- **AI 友善**：完整的型別推導、清晰的 JSDoc、直觀的 API

## 安裝

```bash
bun add @gravito/orbit-broadcasting
```

## 快速開始

### 1. 配置 OrbitBroadcasting

```typescript
import { PlanetCore } from 'gravito-core'
import { OrbitBroadcasting } from '@gravito/orbit-broadcasting'

const core = await PlanetCore.boot({
  orbits: [
    OrbitBroadcasting.configure({
      driver: 'pusher',
      config: {
        appId: 'your-app-id',
        key: 'your-key',
        secret: 'your-secret',
        cluster: 'mt1',
      },
      authorizeChannel: async (channel, socketId, userId) => {
        // 實作頻道授權邏輯
        return true
      },
    }),
  ],
})
```

### 2. 創建可廣播事件

```typescript
import { Event, ShouldBroadcast } from 'gravito-core'
import { PrivateChannel } from '@gravito/orbit-broadcasting'

class OrderShipped extends Event implements ShouldBroadcast {
  constructor(public order: Order) {
    super()
  }

  broadcastOn(): PrivateChannel {
    return new PrivateChannel(`user.${this.order.userId}`)
  }

  broadcastWith(): Record<string, unknown> {
    return {
      order_id: this.order.id,
      status: 'shipped',
      tracking_number: this.order.trackingNumber,
    }
  }

  broadcastAs(): string {
    return 'OrderShipped'
  }
}
```

### 3. 分發事件（自動廣播）

```typescript
// 分發事件時會自動廣播
await core.events.dispatch(new OrderShipped(order))
```

### 4. 手動廣播

```typescript
const broadcast = c.get('broadcast') as BroadcastManager

await broadcast.broadcast(
  event,
  { name: 'user.123', type: 'private' },
  { message: 'Hello' },
  'CustomEvent'
)
```

## 驅動

### Pusher

```typescript
OrbitBroadcasting.configure({
  driver: 'pusher',
  config: {
    appId: 'your-app-id',
    key: 'your-key',
    secret: 'your-secret',
    cluster: 'mt1', // 可選
    useTLS: true, // 可選
  },
})
```

### Ably

```typescript
OrbitBroadcasting.configure({
  driver: 'ably',
  config: {
    apiKey: 'your-api-key',
  },
})
```

### Redis

```typescript
import { RedisDriver } from '@gravito/orbit-broadcasting'

// 需要先設置 Redis 客戶端
const redisDriver = new RedisDriver({
  url: 'redis://localhost:6379',
})

// 設置 Redis 客戶端
redisDriver.setRedisClient(redisClient)

OrbitBroadcasting.configure({
  driver: 'redis',
  config: {
    url: 'redis://localhost:6379',
    keyPrefix: 'gravito:broadcast:', // 可選
  },
})
```

### WebSocket

```typescript
OrbitBroadcasting.configure({
  driver: 'websocket',
  config: {
    getConnections: () => {
      // 返回所有 WebSocket 連接
      return Array.from(websocketConnections.values())
    },
    filterConnectionsByChannel: (channel) => {
      // 根據頻道過濾連接（可選）
      return Array.from(websocketConnections.values()).filter(
        (conn) => conn.subscribedChannels.includes(channel)
      )
    },
  },
})
```

## 頻道類型

### 公開頻道

```typescript
import { PublicChannel } from '@gravito/orbit-broadcasting'

class PublicEvent extends Event implements ShouldBroadcast {
  broadcastOn(): PublicChannel {
    return new PublicChannel('public-channel')
  }
}
```

### 私有頻道

```typescript
import { PrivateChannel } from '@gravito/orbit-broadcasting'

class PrivateEvent extends Event implements ShouldBroadcast {
  broadcastOn(): PrivateChannel {
    return new PrivateChannel(`user.${this.userId}`)
  }
}
```

### 存在頻道

```typescript
import { PresenceChannel } from '@gravito/orbit-broadcasting'

class PresenceEvent extends Event implements ShouldBroadcast {
  broadcastOn(): PresenceChannel {
    return new PresenceChannel('presence-room')
  }
}
```

## 頻道授權

私有頻道和存在頻道需要授權。在配置中提供 `authorizeChannel` 回調：

```typescript
OrbitBroadcasting.configure({
  driver: 'pusher',
  config: { /* ... */ },
  authorizeChannel: async (channel, socketId, userId) => {
    // 檢查使用者是否有權限存取此頻道
    if (channel.startsWith('private-user.')) {
      const channelUserId = channel.replace('private-user.', '')
      return userId?.toString() === channelUserId
    }
    return false
  },
})
```

## API 參考

### BroadcastManager

#### 方法

- `broadcast(event, channel, data, eventName): Promise<void>` - 廣播事件
- `authorizeChannel(channel, socketId, userId): Promise<{ auth, channel_data? } | null>` - 授權頻道存取
- `setDriver(driver: BroadcastDriver): void` - 設置廣播驅動
- `setAuthCallback(callback: ChannelAuthorizationCallback): void` - 設置授權回調

### ShouldBroadcast

事件實作此介面可自動廣播：

- `broadcastOn(): string | Channel` - 指定廣播頻道（必須實作）
- `broadcastWith?(): Record<string, unknown>` - 指定廣播資料（可選）
- `broadcastAs?(): string` - 指定廣播事件名稱（可選）

## 授權

MIT © Carl Lee

