# Gravito Satellite (插件系統) 技術規範書 v1.0

> **核心哲學**：Satellite (衛星) 是環繞著 PlanetCore (行星) 運行的功能單元。它們既能獨立存在（解耦），又能透過「引力」（DI & Hooks）互相擴充與協作。

---

## 1. 架構標準 (Architecture Standard)

所有 Satellite 必須嚴格遵循 **DDD (領域驅動設計)** 與 **Clean Architecture (乾淨架構)**。

### 1.1 內部目錄結構
```text
@gravito/satellite-name/
├── src/
│   ├── Domain/          # 核心業務邏輯 (Entity, VO, Domain Services)
│   │   └── Contracts/   # 介面定義 (對外承諾的功能與需要的依賴)
│   ├── Application/     # 應用層 (UseCases, Command/Query Handlers)
│   │   └── DTOs/        # 數據傳輸對象
│   ├── Infrastructure/  # 基礎設施 (Persistence, External API)
│   │   └── Persistence/Migrations/ # 獨立的資料遷移檔
│   ├── Interface/       # 接口層 (Controllers, CLI, Event Handlers)
│   └── index.ts         # 插件入口 (SatelliteServiceProvider)
├── manifest.json        # 插件能力宣言 (描述提供哪些 Service 與需要的 Bridge)
├── tests/               # 測試代碼 (Unit, Integration)
├── package.json
└── README.md
```

### 1.2 依賴原則
- **內向依賴**：`Infrastructure` -> `Application` -> `Domain` (不允許反向)。
- **核心依賴**：僅允許依賴 `@gravito/enterprise` 與 `gravito-core`。
- **絕對解耦**：嚴禁直接 `import` 其他 Satellite。所有交互必須透過介面或事件。

---

## 2. 資料主權與持久化 (Data Sovereignty)

### 2.1 獨立 Schema 原則
- 每個 Satellite 擁有獨立的資料架構 (Schema)。
- **禁止外鍵 (FK)**：模組間禁止建立資料庫外鍵，僅透過邏輯 ID (UUID) 關聯。
- **禁止跨模組 JOIN**：嚴禁在 A 模組中撰寫查詢 B 模組資料表的 SQL。

### 2.2 遷移自動發現 (Discovery)
- 插件必須透過入口類別暴露遷移路徑。
- 腳手架工具負責在 `gravito migrate` 時彙整所有已安裝衛星的遷移任務。

### 2.3 資料表擴充 (Schema Extension)
- 允許透過 `Extension Satellite` 執行「增量遷移」(Incremental Migration)，在不改動原插件原始碼的情況下，對現有資料表進行 `ALTER TABLE`。

---

## 3. 調度與行為編排 (Orchestration)

### 3.1 標的導向開發 (Target-Oriented)
- 插件開發者應將插件視為一個**「自治的原子 API」**，只對外提供原子化的功能。
- **編排位置**：跨模組的業務流程必須寫在 **「主應用程式 (The Hub)」** 的 `Application/UseCases` 中。

### 3.2 編排模式 (UseCase Orchestration)
- 主應用程式擔任「指揮家」，在一個 UseCase 中依序呼叫不同衛星的 Service，並處理之間的數據轉換 (Mapping)。

---

## 4. 組合與協助工具規範 (Composition & Tooling)

### 4.1 智慧鏈結 (Smart Linking)
- **`gravito satellite:link`**：自動掃描各衛星的 `manifest.json`，發現未滿足的依賴介面，並自動產生「橋接代碼 (Glue Code)」樣板。

### 4.2 編排劇本 (Playbooks)
- 提供針對常見場景（如電商結帳）的官方編排模板。開發者可透過腳手架快速生成成熟的跨模組調度邏輯。

### 4.3 數據充水器 (Hydrators)
- 提供工具自動將邏輯 ID (如 `user_id`) 轉換為人類可讀資訊 (如 `user_name`)，解決跨模組查詢的顯示需求。

---

## 5. 擴充與裝飾 (Extension & Decoration)

### 5.1 橫向擴充 (Hooks)
- 利用 `HookManager` 在關鍵邏輯處保留掛鉤。
- 每個 Satellite 必須在 `README.md` 中列出所有可供攔截的 `Actions` 與 `Filters`。

### 5.2 縱向擴充 (DI Override)
- 允許主應用程式透過 DI 容器重新綁定 (Rebind) 某個介面的實作，實現功能的完全替換。

---

## 6. 合規性檢查 (Compliance)

- [ ] 是否完全移除對其他插件的靜態引用？
- [ ] 遷移檔案是否存放在規範目錄中？
- [ ] 是否具備對應的 Mock 實作供組裝者測試？
- [ ] `manifest.json` 是否清晰描述了 Capabilities 與 Requirements？