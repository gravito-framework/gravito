# @gravito/launchpad

> 🚀 Bun 火箭回收系統：專為 Bun 打造的秒級容器部署與生命週期管理系統。

## 核心特性

- **Rocket Pool**: 預熱容器池，消除啟動冷啟動。
- **Payload Injection**: 跳過 Docker Build，透過 `docker cp` 秒級注入代碼。
- **DDD 架構**: 基於 `@gravito/enterprise` 實作，具備嚴謹的狀態機管理。
- **可回收性**: 任務結束後自動翻新容器，資源零浪費。

## 架構概覽

本套件遵循 **Clean Architecture** 與 **DDD**:

- **Domain**: 定義 `Rocket` 狀態機與 `Mission` 邏輯。
- **Application**: `PoolManager` (調度) 與 `PayloadInjector` (部署)。
- **Infrastructure**: 底層 Docker 與 Git 操作實作。

## 快速開始

```typescript
import { PoolManager, PayloadInjector } from '@gravito/launchpad'
import { DockerAdapter, ShellGitAdapter, InMemoryRocketRepository } from '@gravito/launchpad/infra'

const manager = new PoolManager(new DockerAdapter(), new InMemoryRocketRepository())
const injector = new PayloadInjector(new DockerAdapter(), new ShellGitAdapter())

// 1. 預熱池子
await manager.warmup(3)

// 2. 指派任務
const mission = Mission.create({ ... })
const rocket = await manager.assignMission(mission)

// 3. 秒級部署
await injector.deploy(rocket)
```

## 測試

```bash
bun test
```
