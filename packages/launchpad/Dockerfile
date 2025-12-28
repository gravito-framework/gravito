FROM oven/bun:1.0 AS base
WORKDIR /usr/src/app

# 安裝 Docker CLI，讓容器能與宿主機的 Docker Socket 通訊
RUN apt-get update && apt-get install -y docker.io

# 複製 Monorepo 必要套件
COPY package.json bun.lockb ./
COPY packages/core ./packages/core
COPY packages/enterprise ./packages/enterprise
COPY packages/ripple ./packages/ripple
COPY packages/stasis ./packages/stasis
COPY packages/launchpad ./packages/launchpad

# 安裝依賴並建立連結
RUN bun install

# 設定工作目錄到 launchpad
WORKDIR /usr/src/app/packages/launchpad

# 暴露 API (4000) 與 反向代理 (8080)
EXPOSE 4000
EXPOSE 8080

# 啟動服務
ENTRYPOINT [ "bun", "run", "server.ts" ]
