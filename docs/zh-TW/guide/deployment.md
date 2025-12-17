---
title: 部署指南
---

# 部署指南

Gravito 支援兩種主要的部署策略：**二進位優先 (Binary-First)**（推薦）與 **Docker 容器化**。

---

## 選項 1: 單一執行檔 (Binary-First)

這是 Gravito 的旗艦功能。將你的整個應用程式編譯為獨立的執行檔。

### 建置指令

```bash
# 1. 建置前端資源 (如果有使用 Inertia)
bun run build:client

# 2. 編譯後端為單一執行檔
bun build --compile --outfile=server ./src/index.ts
```

### 輸出結構

部署時，你需要此執行檔以及靜態資源資料夾：

```
/opt/app/
├── server              # 獨立的二進位執行檔
└── static/            # 靜態資源資料夾 (由 Nginx 或 Gravito 提供服務)
    ├── build/         # Vite 輸出的資源 (CSS, JS)
    └── public/        # 公用圖片、字型
```

### 優勢

| 優點 | 描述 |
|------|------|
| **零依賴** | 伺服器無需安裝 Node, npm, 或 Bun |
| **部署簡單** | 只需複製執行檔與 static 資料夾 |
| **快速啟動** | 亞毫秒級冷啟動 |
| **安全性** | 原始碼已編譯，不外洩 |

### 部署步驟

1. **在開發機上建置:**
   ```bash
   bun run build:client
   bun build --compile --outfile=server ./src/index.ts
   ```

2. **複製到生產伺服器:**
   ```bash
   scp server user@host:/opt/app/
   scp -r static/ user@host:/opt/app/
   ```

3. **在 Linux 上執行:**
   ```bash
   chmod +x /opt/app/server
   /opt/app/server
   ```

4. **設定 systemd service (可選):**
   ```ini
   [Unit]
   Description=Gravito Application
   After=network.target

   [Service]
   Type=simple
   User=www-data
   WorkingDirectory=/opt/app
   ExecStart=/opt/app/server
   Restart=on-failure
   Environment=PORT=3000
   Environment=NODE_ENV=production

   [Install]
   WantedBy=multi-user.target
   ```

---

## 選項 2: Docker 容器化 (企業標準)

適用於需要容器編排的團隊 (Kubernetes, Docker Swarm)。

### 多階段 Dockerfile

```dockerfile
# ============================================
# Stage 1: Build
# ============================================
FROM oven/bun:1 AS builder

WORKDIR /app

# 複製 package 檔案
COPY package.json bun.lock ./
# 如果是 monorepo，可能需要複製 packages 目錄
COPY packages/ ./packages/

RUN bun install --frozen-lockfile

# 複製原始碼
COPY . .

# 建置前端資源
RUN bun run build:client

# ============================================
# Stage 2: Production
# ============================================
FROM oven/bun:1-slim

WORKDIR /app

# 複製建置好的資源
COPY --from=builder /app/static ./static
COPY --from=builder /app/src ./src
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .

ENV NODE_ENV=production
EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
```

### Docker Compose 範例

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgres://postgres:password@db:5432/app
    depends_on:
      - db
    restart: unless-stopped
    volumes:
       - ./static:/app/static

  db:
    image: postgres:16-alpine
    volumes:
      - pgdata:/var/lib/postgresql/data
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=app

volumes:
  pgdata:
```

---

## 生產環境檢查清單

部署前，請確保：

| 項目 | 指令/行動 |
|------|-----------|
| 執行測試 | `bun test` |
| 建置前端 | `bun run build:client` |
| 設定 `NODE_ENV` | `export NODE_ENV=production` |
| 設定機密 | 使用環境變數，勿用 `.env` |
| 啟用 HTTPS | 使用反向代理 (nginx, Caddy) |
| 設定日誌 | 設定日誌聚合 |
| 健康檢查 | 實作 `/health` 端點 |

---

## 反向代理設定

### Nginx

```nginx
server {
    listen 80;
    server_name example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name example.com;

    ssl_certificate /etc/ssl/certs/example.com.pem;
    ssl_certificate_key /etc/ssl/private/example.com.key;

    # 直接服務靜態檔案 (效能優化)
    location /assets/ {
        alias /opt/app/static/build/assets/;
        expires 30d;
        access_log off;
    }

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip 壓縮
    gzip on;
    gzip_types text/plain application/json application/javascript text/css;
}
```

### Caddy (更簡單的替代方案)

```caddyfile
example.com {
    reverse_proxy localhost:3000
    file_server /assets/* {
        root /opt/app/static/build/assets
    }
}
```

---

## 監控

### 健康檢查端點

```typescript
// src/routes/health.ts
core.app.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})
```

---

## 安全建議

1. **絕不提交機密** - 使用環境變數
2. **謹慎啟用 CORS** - 在生產環境限制來源 (Origin)
3. **速率限制 (Rate limiting)** - 防止 DDoS
4. **保持依賴更新** - 定期安全審計
5. **僅使用 HTTPS** - 強制重定向 HTTP 流量
