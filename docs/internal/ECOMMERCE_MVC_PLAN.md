# E-Commerce MVC + SPA 範例架構規劃（Draft）

此文件為**規劃稿**，不包含實作。目標是建立「可由 CLI 生成 MVC 結構」的電商範例架構，並符合以下需求：

- SPA 使用 Vue
- Email 模板使用 Vue
- Queue 使用自家套件（Redis 驅動）
- 使用 Luminosity 產生 sitemap
- 支援訪客購物車與登入後合併
- 提供歷史訂單頁用於驗證 DB 內容

---

## 1) 架構總覽

### 主要模組（建議）
- `@gravito/orbit-db`：資料層（商品/訂單/會員/購物車）
- `@gravito/sentinel`：登入驗證
- `@gravito/stasis`：購物車快取（可搭配 Redis）
- `@gravito/flare`：寄信服務（由 Queue 驅動）
- `@gravito/luminosity`：SEO / sitemap
- `@gravito/ion`：SPA 整合（Vue）
- Queue 套件（自家）：Redis 驅動

### 範例頁面
- 首頁：商品列表（10 個）
- 商品詳情：規格選擇 + 加入購物車
- 購物車：數量調整 / 移除
- 結帳：填寫收件資訊 + 付款方式
- 歷史訂單：驗證 DB 訂單記錄
- 關於我們 / 隱私權
- 登入頁（登入成功回原頁）

### 圖片
全部使用線上圖庫 URL，不產生本地圖片檔案。

---

## 2) 路由規劃（MVC + SPA）

### 公開頁面
- `GET /`：首頁（商品列表）
- `GET /about`
- `GET /privacy`
- `GET /products/:slug`：商品詳情

### 會員流程
- `GET /login`
- `POST /login`（成功後導向 redirect）

### 購物車與結帳
- `POST /cart/add`（未登入 → redirect 到 `/login?redirect=...`）
- `GET /cart`
- `POST /cart/update`
- `POST /cart/remove`
- `GET /checkout`
- `POST /checkout`

### 歷史訂單
- `GET /orders`（需登入）

### SEO
- `GET /sitemap.xml`（由 Luminosity 產出）
- `GET /robots.txt`

---

## 3) 資料模型（概念）

### User
- id
- email
- passwordHash
- name

### Product
- id
- title
- slug
- description
- price
- imageUrl

### ProductVariant
- id
- productId
- name（例如：顏色/尺寸/容量）
- options（例如：red/blue 或 350ml/450ml）

### Cart
- id
- userId?（登入後綁定）
- sessionId?（訪客）
- items[]

### CartItem
- cartId
- productId
- variantId
- qty
- unitPrice

### Order
- id
- userId
- total
- status
- shippingName
- shippingAddress
- paymentMethod

### OrderItem
- orderId
- productId
- variantId
- qty
- unitPrice

---

## 4) 訪客購物車 → 登入合併流程

1. 訪客加入購物車 → 以 `sessionId` 存在快取或 DB  
2. 登入成功後：
   - 讀取訪客購物車
   - 合併至使用者購物車
   - 清除訪客購物車資料
3. 導回 `redirect` 原始頁面

---

## 5) 結帳與寄信流程（Queue 非同步）

1. 使用者送出結帳表單  
2. 建立訂單（DB）
3. 投遞 Queue 任務（自家套件 + Redis）
4. Worker 取出任務 → 產生 Vue Email 模板 → 寄送

### Email 內容（Vue 模板）
- 訂單編號
- 商品清單（名稱 / 規格 / 數量 / 小計）
- 收件資訊
- 付款方式
- 總金額

---

## 6) Sitemap（Luminosity）

### resolvers
- 靜態頁：`/`, `/about`, `/privacy`, `/login`, `/cart`, `/checkout`, `/orders`
- 動態頁：所有商品 `/products/:slug`

---

## 7) 測試帳號（Seed）

- email: `test@gravito.dev`
- password: `Password123!`

用途：驗證登入、購物車、結帳、歷史訂單流程。

---

## 8) CLI 生成 MVC 架構（後續實作方向）

### 預期輸出
- Controllers / Models / Views / Routes 基礎結構
- 預載商品資料 + 種子帳號
- SPA 前端骨架（Vue）
- Queue worker scaffold

---

## 9) 待確認事項

- Queue 自家套件 API 介面與使用方式
- Vue Email 模板使用方式（render pipeline）
- SPA 路由對應 MVC 控制器邊界
- 購物車資料要存 DB 或 Cache（或混合）
