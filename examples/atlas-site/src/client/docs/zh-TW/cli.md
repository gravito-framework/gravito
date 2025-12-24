# 軌道控制：Atlas CLI

> **當前狀態：** 指令介面已啟動。
> Atlas CLI 是您進行資料庫治理、遷移與腳手架生成的任務控制中心。

## 使用方式

專為 Bun 執行環境打造，Atlas CLI 極致快速且易於使用。

```bash
bun atlas <command> [flags]
```

## 遷移指令 (Migration Commands)

以精準度管理您的資料庫架構演進。

### `migrate`
執行所有待處理的遷移，同步至最新的架構版本。
```bash
bun atlas migrate
```

### `migrate:rollback`
還原最後一批執行過的遷移。
```bash
# 還原一批（預設）
bun atlas migrate:rollback

# 還原多批
bun atlas migrate:rollback --step 2
```

### `migrate:fresh`
清除整個資料庫並從頭開始重新執行所有遷移。
```bash
bun atlas migrate:fresh
```

### `migrate:status`
查看哪些遷移已執行，哪些仍處於待處理狀態。
```bash
bun atlas migrate:status
```

## 腳手架指令 (Scaffolding Commands)

快速生成應用程式的核心組件。

### `make:model <name>`
建立一個具備預設配置結構的 ORM 模型。
```bash
bun atlas make:model User
```

### `make:migration <name>`
生成一個帶有時間戳的全新遷移檔案。
```bash
bun atlas make:migration create_users_table
```

## 資料填充指令 (Seeding Commands)

為您的資料庫注入生命。

### `seed`
執行所有已註冊的 Seeders，對您的資料環境進行地球化改造。
```bash
bun atlas seed
```

## 全域旗標 (Global Flags)

| 旗標 | 說明 | 預設值 |
| :--- | :--- | :--- |
| `--path` | 遷移或模型檔案的目標路徑 | `database/migrations` |
| `--seed-path` | Seeders 的目標路徑 | `database/seeders` |
| `--step` | 要還原的遷移批次數量 | `1` |

> 「掌控，是重力的第一原則。」
