# 🎯 批次處理功能 - 快速測試指南

## ✅ 已創建測試資料

```
✓ test-batch          → 100 個 waiting 工作
✓ test-batch-fail     → 50 個 waiting + 25 個 failed 工作
✓ test-batch-delayed  → 30 個 delayed 工作
```

---

## 🚀 立即開始測試

### 1. 打開 Flux Console
```
http://localhost:3000
```

### 2. 快速測試流程

#### 測試 1: 批次刪除 (2 分鐘)
1. 點擊 `test-batch` 佇列的 "Inspect"
2. 勾選 10 個工作
3. 點擊 "Delete Selected"
4. 確認對話框 → Confirm
5. ✅ 工作被刪除

#### 測試 2: 刪除全部 (1 分鐘)
1. 在 `test-batch` 佇列中
2. 看到警告橫幅："Showing 50 of 90 total"
3. 點擊 "Delete All 90"
4. 確認警告對話框 → Confirm
5. ✅ 所有工作被刪除

#### 測試 3: 批次重試失敗工作 (2 分鐘)
1. 點擊 `test-batch-fail` 佇列的 "Inspect"
2. 切換到 "Failed" 標籤
3. 看到 25 個失敗工作
4. 選擇 5 個工作
5. 點擊 "Retry Selected"
6. ✅ 工作移至 waiting

#### 測試 4: 重試所有失敗工作 (1 分鐘)
1. 在 `test-batch-fail` 的 "Failed" 標籤
2. 點擊 "Retry All 20" (剩餘的)
3. 確認對話框 → Confirm
4. ✅ 所有失敗工作被重試

#### 測試 5: 批次處理延遲工作 (2 分鐘)
1. 點擊 `test-batch-delayed` 佇列的 "Inspect"
2. 切換到 "Delayed" 標籤
3. 看到 30 個延遲工作（顯示排程時間）
4. 選擇 10 個工作
5. 點擊 "Retry Selected"（立即處理）
6. ✅ 工作移至 waiting

#### 測試 6: 鍵盤快捷鍵 (1 分鐘)
1. 在任何佇列檢查器中
2. 按 **Ctrl+A** (Mac: Cmd+A)
3. ✅ 所有可見工作被選中
4. 按 **Escape**
5. ✅ 選擇被清除
6. 再按 **Escape**
7. ✅ 檢查器關閉

---

## 🎨 UI 功能檢查

### 視覺元素
- [ ] 核取方塊顯示正常
- [ ] 選中的工作有藍色光環
- [ ] 顯示 "X items selected"
- [ ] 琥珀色警告橫幅顯示總數
- [ ] "Delete All X" 和 "Retry All X" 按鈕

### 確認對話框
- [ ] 動畫流暢（Framer Motion）
- [ ] 顯示工作數量和佇列名稱
- [ ] "Delete All" 顯示 ⚠️ 警告符號
- [ ] 載入時顯示轉圈動畫
- [ ] 按鈕在處理中被禁用

### 互動行為
- [ ] 點擊核取方塊選擇/取消選擇
- [ ] 點擊工作卡片區域也可選擇
- [ ] "Select All (Page)" 正常運作
- [ ] 切換標籤時選擇被清除
- [ ] 封存工作沒有核取方塊

---

## 🧹 測試完成後清理

```bash
bun scripts/test-batch-operations.ts cleanup
```

---

## 📊 預期結果

所有測試案例應該：
- ✅ 無錯誤訊息
- ✅ UI 即時更新
- ✅ 確認對話框正常顯示
- ✅ 載入狀態正確顯示
- ✅ 鍵盤快捷鍵正常運作
- ✅ 佇列統計即時更新

---

## 🐛 如果遇到問題

1. 檢查瀏覽器控制台是否有錯誤
2. 檢查後端終端是否有錯誤
3. 重新整理頁面
4. 清理測試資料後重新創建

---

**預計測試時間**: 10-15 分鐘  
**難度**: 簡單  
**狀態**: ✅ 測試資料已就緒
