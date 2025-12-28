# 🛰️ Gravito Satellite Specification (GASS) v1.0

這份文件定義了 Gravito 生態系中衛星模組（Satellite）的開發標準，旨在確保模組的高內聚、低耦合以及卓越的開發者體驗（DX）。

## 1. 核心哲學
- **DDD 驅動**: 邏輯應位於 Domain 層，而非框架層。
- **配置化優先**: 所有的品牌標誌、顏色與外部連結都應是可配置的。
- **Hooks 通訊**: 插件之間透過 Hook 而非直接引用來協作。

## 2. 標準目錄結構
```text
src/
├── Domain/           # 業務邏輯、實體 (Entities)、介面定義
├── Application/      # UseCases (業務流程)、DTOs (數據交換)
├── Infrastructure/   # 持久化實現 (Repositories)、外部驅動
└── Interface/        # HTTP 中間件、控制器、CLI 指令
```

## 3. 命名與註冊規範
- **類名**: 必須以 `ServiceProvider` 結尾（如 `MembershipServiceProvider`）。
- **容器鍵名**: 建議使用 `插件名.功能` 格式（如 `membership.register`）。
- **Hook 命名**: `插件名:動作`（如 `membership:registered`）。

## 4. 品牌抽象化標準
所有的郵件或 UI 內容應遵循以下獲取模式：
```typescript
const brandingName = core.config.get('membership.branding.name', 'Default App');
```

## 5. 隊列配套標準
所有對外發出的副作用（Side Effects）動作應預設支援排程：
```typescript
// 優雅降級模式
async queue(job) {
  const queue = container.make('queue');
  if (queue) return queue.push(job);
  return this.send(job); // 同步回退
}
```

## 6. 驗證清單 (CI Checklist)
- [ ] 是否在 `satellites/` 目錄下？
- [ ] 是否導出了 `ServiceProvider`？
- [ ] 所有的 `require()` 是否已替換為 `import`？
- [ ] 是否包含 `README.md` 與 `docs/EXTENDING.md`？
- [ ] 是否通過了 `grand-review.ts` 整合測試？

---
*Created by Gravito Core Team.*
