---
title: 架構設計
order: 3
---

# 架構設計

Luminosity 的核心採用 **LSM-Tree（日誌結構合併樹）** 架構，與 Cassandra、LevelDB、RocksDB 等高效能資料庫使用的儲存引擎相似。

這種架構選擇使 Luminosity 能夠以極小的記憶體佔用處理數百萬個 URL，並實現極快的寫入效能。

## 核心概念

<a id="atomic-sequential-writes"></a>

### 1. 原子級順序寫入

傳統的 sitemap 生成器通常受到 **隨機 I/O 瓶頸** 的困擾——每次 URL 更新都需要讀取、修改和重寫一個大型 XML 檔案。

Luminosity 採用了根本不同的方法：

```
[新 URL] → [追加到日誌] → [記憶體緩衝] → [背景合併]
```

**運作原理：**
- 新 URL 被 **追加** 到順序日誌檔案（`sitemap.ops.jsonl`）
- 每個寫入操作都是原子性的，只進行追加
- 寫入時不需要檔案鎖定
- 零讀取-修改-寫入循環

**優勢：**
- 寫入速度接近硬體極限（約 70,000 次操作/秒）
- 高流量場景下無鎖競爭
- 崩潰安全：不完整的寫入不會損壞現有資料

```typescript
// 原子寫入範例
await engine.getStrategy().add({
  url: 'https://example.com/new-page',
  lastmod: new Date(),
  priority: 0.8
})
// 這是只追加操作，立即持久化
```

---

<a id="dynamic-compaction"></a>

### 2. 動態壓縮

隨著只追加日誌的增長，需要定期整合。Luminosity 的 **Compactor** 會在閒置週期自動處理此過程。

```
[日誌 1] + [日誌 2] + [快照] → [合併後的快照]
```

**運作原理：**
- 背景執行緒監控日誌大小
- 達到閾值時觸發壓縮
- 將多個日誌檔案合併為單一快照
- 移除重複和已刪除的條目
- 運行時不阻塞讀寫操作

**配置方式：**
```typescript
const engine = new SeoEngine({
  mode: 'incremental',
  baseUrl: 'https://example.com',
  incremental: {
    logDir: './.luminosity',
    compactInterval: 3600000 // 每小時壓縮一次
  }
})
```

**透過 CLI 手動壓縮：**
```bash
bun lux:compact --force
```

---

<a id="zero-copy-serialization"></a>

### 3. 零拷貝序列化

在提供 sitemap 時，Luminosity 利用 **串流 XML 生成** 來避免將整個資料集載入記憶體。

```
[磁碟/記憶體] → [串流轉換器] → [XML 輸出]
```

**運作原理：**
- 條目以串流方式讀取，而非完整載入記憶體
- XML 元素使用直接緩衝區寫入即時生成
- HTTP 回應在所有條目處理完成前就開始傳輸
- 無論 sitemap 大小，記憶體使用量保持恆定

**記憶體高效服務：**
```typescript
// 以約 80MB 記憶體處理 100 萬以上的 URL
const entries = await engine.getStrategy().getEntries()
const xml = renderer.render(entries, requestUrl)
```

這種方法意味著一個擁有 100 萬個 URL 的網站在 sitemap 生成時使用的記憶體與僅有 1,000 個 URL 的網站大致相同。

---

<a id="tiered-storage"></a>

### 4. 分層儲存

Luminosity 自動管理跨多個儲存層的資料，以實現最佳效能：

```
[熱資料：記憶體快取]
         ↓
[溫資料：操作日誌]
         ↓
[冷資料：快照檔案]
```

**層級說明：**

| 層級 | 儲存方式 | 存取速度 | 使用場景 |
|------|---------|----------|----------|
| L0（熱） | 記憶體快取 | ~1μs | 最近更新、活躍查詢 |
| L1（溫） | JSONL 日誌檔 | ~1ms | 待處理操作 |
| L2（冷） | 快照 JSON | ~10ms | 歷史資料、備份 |

**自動資料遷移：**
- 新條目從 L0（記憶體）開始
- 定期刷新到 L1（日誌檔案）
- 壓縮將 L1 合併到 L2（快照）
- 讀取時透明地合併所有層級

```typescript
// 範例：快取預熱將冷資料載入熱層
await engine.getStrategy().warmCache()
```

---

## 管線視覺化

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   輸入      │───▶│   記憶體    │───▶│   磁碟      │───▶│   輸出      │
│   串流      │    │   緩衝區    │    │   區段      │    │ (XML/JSON)  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     │                   │                  │                  │
     ▼                   ▼                  ▼                  ▼
  HTTP POST         記憶體表            不可變表           sitemap.xml
  Webhook          （記憶體內）         快照檔案           robots.txt
  CLI 命令          排序映射                              JSON-LD
```

## 效能基準測試

使用這些架構模式，Luminosity 達成：

| 指標 | 數值 |
|------|------|
| 索引的 URL 數量 | 1,000,000 |
| 建置時間 | 14.2 秒 |
| 記憶體峰值 | 84 MB |
| 吞吐量 | ~70,000 URLs/秒 |

詳細的方法論和結果請參閱 [效能基準測試](/zh/docs/benchmark) 頁面。

## 下一步

- [快速開始](/zh/docs/getting-started) - 快速設定指南
- [CLI 命令列工具](/zh/docs/cli) - Luminosity 的終端控制
- [框架整合](/zh/docs/frameworks) - 連接您的技術堆疊
