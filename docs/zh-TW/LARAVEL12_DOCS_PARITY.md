---
title: Laravel 12 對齊項目與模組對應規劃
---

# Laravel 12 對齊項目與模組對應規劃

本文件用於盤點 Laravel 12 官網左側導覽的文件項目，並對應到 Gravito 現有模組與文件，標記缺口以便後續補齊或新增模組。

另有既定的左側導覽架構提案可參考：`docs/zh-TW/DOCS_NAV_PROPOSAL.md`。

## 對應原則

- 以 Laravel 12 導覽分類為主，逐項建立對應或缺口標記。
- 先對應現有文件，後續再拆分成「單一主題一頁」。
- 缺口一律標記「規劃新增」或「規劃補文件」。

## Getting Started

| Introduction / Overview | `docs/zh-TW/guide/introduction.md` | 已建立完整產品定位與架構理念 |
| Installation | `docs/zh-TW/guide/installation.md` | 已拆分獨立安裝頁面 |
| Quick Start | `docs/zh-TW/guide/quick-start.md` | 已建立 5 分鐘快速上手範例 |
| Configuration | `docs/zh-TW/guide/core-concepts.md` | 需補 `gravito.config` 章節 |
| Directory Structure | `docs/zh-TW/guide/project-structure.md` | 已更新為 Enterprise MVC 標準目錄結構 |
| Frontend | `docs/zh-TW/guide/inertia-react.md`、`docs/zh-TW/guide/inertia-vue.md` | 可補非 Inertia 的前端選項 |
| Starter Kits | `docs/zh-TW/guide/authentication.md` | 已提供 Fortify 認證腳手架 (Breeze-like) |
| Deployment | `docs/zh-TW/guide/deployment.md` | 可補 Docker 與平台指引 |

## Architecture Concepts

| Laravel 12 項目 | Gravito 對應 | 備註 |
| --- | --- | --- |
| Request Lifecycle | `docs/zh-TW/guide/architecture.md` | 已包含核心請求生命週期 |
| Service Container | `docs/zh-TW/guide/architecture.md` | 已包含 IoC 容器與依賴注入 |
| Service Providers | `docs/zh-TW/guide/architecture.md` | 已包含服務提供者導引機制 |
| Facades | `docs/zh-TW/api/atlas/getting-started.md` | 已補 DB Facade 使用 |

## The Basics

| Laravel 12 項目 | Gravito 對應 | 備註 |
| --- | --- | --- |
| Routing | `docs/zh-TW/guide/routing.md` | 已補進階路由模式與簽名路由 |
| Middleware | `docs/zh-TW/guide/middleware.md` | 已補全域/群組與優先權設計 |
| CSRF Protection | `docs/zh-TW/guide/csrf-protection.md` | 已建立獨立指南 |
| Controllers | `docs/zh-TW/guide/controllers.md` | 已包含 Resource 風格 |
| Requests | `docs/zh-TW/guide/requests.md` | 已包含基礎解析 |
| Responses | `docs/zh-TW/guide/responses.md` | 已補檔案回應與下載 |
| Views | `docs/zh-TW/guide/template-engine.md` | 對應 Template Engine |
| Blade Templates | 規劃新增 | 可補模板語法對照或替代方案 |
| URLs | `docs/zh-TW/guide/urls.md` | 已建立 URL 生成與簽名指南 |
| Session | `docs/zh-TW/guide/sessions.md` | 已建立 Session 基礎指南 |
| Validation | `docs/zh-TW/guide/validation.md` | 已補 Form Request 風格 |
| Error Handling | `docs/zh-TW/guide/errors.md` | 已建立例外處理指南 |
| Logging | `docs/zh-TW/guide/logging.md` | 已建立日誌系統指南 |
| Asset Bundling (Vite) | `docs/zh-TW/guide/vite.md` | 已建立資產打包指南 |

## Digging Deeper

| Laravel 12 項目 | Gravito 對應 | 備註 |
| --- | --- | --- |
| Artisan Console | `docs/zh-TW/guide/pulse-cli.md` | 已補 Pulse CLI 基本指令 |
| Broadcasting | `docs/zh-TW/guide/broadcasting.md` | 已補 Radiance 廣播機制 |
| Cache | `docs/zh-TW/api/stasis.md` | 已補 Cache 驅動與 API |
| Collections | `docs/zh-TW/guide/helpers.md` | 使用 Arr 提供之集合操作函式 |
| Contracts | 規劃新增 | 對應介面與擴充協議 |
| Events | `docs/zh-TW/guide/core-concepts.md` | 可補事件處理進階範例 |
| Filesystem | `docs/zh-TW/api/nebula.md` | 已補 Nebula 檔案儲存 |
| Helpers | `docs/zh-TW/guide/helpers.md` | 已提供 Arr, Str, dataGet 等工具 |
| HTTP Client | 規劃新增 | 規劃內建 HTTP 用戶端 |
| Localization | `docs/zh-TW/guide/i18n-guide.md` | 已包含 i18n 指南 |
| Mail | `docs/zh-TW/guide/mail.md` | 已補 Signal 郵件發送系統 |
| Notifications | `docs/zh-TW/guide/notifications.md` | 已補 Flare 多通路通知系統 |
| Package Development | `docs/zh-TW/guide/plugin-development.md` | 已包含外掛開發指南 |
| Process | 規劃新增 | 規劃程序管理 |
| Queues | `docs/zh-TW/guide/queues.md` | 已補 Stream 佇列系統 |
| Rate Limiting | `docs/zh-TW/api/stasis.md` | 已包含在 Stasis Locks 說明中 |
| Strings | `docs/zh-TW/guide/helpers.md` | 已包含在 Str 工具指南中 |
| Task Scheduling | `docs/zh-TW/guide/horizon.md` | 已補 Horizon 任務排程系統 |

## Security

| Laravel 12 項目 | Gravito 對應 | 備註 |
| --- | --- | --- |
| Authentication | `docs/zh-TW/guide/authentication.md` | 已補完整 Fortify 流程範例 |
| Authorization | `docs/zh-TW/guide/authorization.md` | 已建立 Gate 與 Policy 指南 |
| Email Verification | `docs/zh-TW/guide/authentication.md` | 已補實作流程 |
| Encryption | `docs/zh-TW/guide/security.md` | 已補基本加解密說明 |
| Hashing | `docs/zh-TW/api/sentinel.md` | 已包含 HashManager 說明 |
| Password Reset | `docs/zh-TW/guide/authentication.md` | 已包含在 Fortify 指南中 |
| Sanctum | `docs/zh-TW/guide/authentication.md#api-tokens` | 已包含 API Token 驗證 (Sanctum-like) |

## Database

| Laravel 12 項目 | Gravito 對應 | 備註 |
| --- | --- | --- |
| Getting Started | `docs/zh-TW/api/atlas/getting-started.md` | 已包含多資料庫與基礎配置 |
| Query Builder | `docs/zh-TW/api/atlas/query-builder.md` | 已包含完整查詢介面 |
| Migrations | `docs/zh-TW/api/atlas/migrations-seeding.md` | 已包含 Blueprint 指南 |
| Seeding | `docs/zh-TW/api/atlas/migrations-seeding.md` | 已包含 Factory 與 Seeder 指南 |
| Redis | `docs/zh-TW/guide/database/redis.md` | 已建立基礎與進階用法指南 |

## Eloquent ORM

| Laravel 12 項目 | Gravito 對應 | 備註 |
| --- | --- | --- |
| Getting Started | `docs/zh-TW/guide/orm-usage.md`、`docs/zh-TW/api/atlas/models.md` | - |
| Relationships | `docs/zh-TW/api/atlas/relations.md` | - |
| Collections | 規劃新增 | 規劃模型集合 |
| Mutators / Casts | `docs/zh-TW/api/atlas/models.md` | 已補 Casting 說明 |
| API Resources | 規劃新增 | 規劃序列化層 (Transformers) |
| Serialization | `docs/zh-TW/api/atlas/serialization.md` | 已補 Hidden/Visible/Appends 說明 |

## Testing

| Laravel 12 項目 | Gravito 對應 | 備註 |
| --- | --- | --- |
| Getting Started | `docs/zh-TW/guide/testing.md` | 使用 HttpTester 進行整合測試 |
| HTTP Tests | `docs/zh-TW/guide/testing.md` | 已包含回應斷言與 API 測試 |
| Console Tests | 規劃新增 | 規劃 CLI 輸出測試 |
| Database Testing | `docs/zh-TW/guide/database/testing.md` | 已補測試資料庫與 Transaction 說明 |
| Mocking | `docs/zh-TW/guide/testing.md#mocking` | 已補 IoC 容器 Mocking 方法 |
| Authentication | 規劃新增 | 規劃測試守衛 |
| Browser Tests | 規劃新增 | 規劃 E2E |

## Packages

| Laravel 12 項目 | Gravito 對應 | 備註 |
| --- | --- | --- |
| Package Development | `docs/zh-TW/guide/plugin-development.md` | 已包含發布流程與開發規範 |
| Starter Kits | `docs/zh-TW/guide/authentication.md` | 已提供 Fortify 認證腳手架 (Breeze-like) |
| Monitoring | `docs/zh-TW/guide/monitor.md` | 已提供 Monitor 健康檢查與度量 (Pulse-like) |
| Webhooks | `docs/zh-TW/guide/echo.md` | 已提供 Echo Webhook 收發系統 |
| API Tokens | `docs/zh-TW/guide/authentication.md#api-tokens` | 已包含在 Sentinel 認證文件中 (Sanctum-like) |
| Broadcasting | `docs/zh-TW/guide/broadcasting.md` | 已提供 Radiance 廣播系統 |
| Task Scheduling | `docs/zh-TW/guide/horizon.md` | 已提供 Horizon 分散式排程器 |

