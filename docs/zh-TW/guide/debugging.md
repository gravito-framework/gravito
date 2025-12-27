# 除錯與觀測 (Debugging)

Gravito 內建了多種工具來協助你除錯應用程式並監控其效能。本機除錯的主要工具是 **Spectrum**。

## Spectrum: 除錯儀表板

Spectrum 是一個即時觀測儀表板，它直接整合在 Gravito 框架中。它允許你監控：

- **HTTP 請求**: 查看標頭、內容並重放請求。
- **資料庫查詢**: 查看 Atlas ORM 執行的確切 SQL。
- **日誌**: 將應用程式日誌與傳入的請求進行關聯。

關於安裝與配置的詳細說明，請參閱專屬的 [Spectrum 指南](./spectrum.md)。

## 本機除錯技巧

### 使用 Logger
Gravito 核心日誌系統已與 Spectrum 整合。當你使用 `core.logger` 時，你的日誌會自動出現在儀表板的串流中。

```typescript
core.logger.info('使用者已登入', { userId: 123 });
```

### REPL / 互動式控制台
你可以使用 Gravito CLI 進入一個已載入應用程式上下文的互動式 REPL 環境：

```bash
gravito console
```

---

## 下一步
- [Spectrum 儀表板](./spectrum.md)
- [錯誤處理指南](./errors.md)
- [日誌深入探討](./logging.md)
