# Stage 1: Build
FROM oven/bun:1.0 AS build
WORKDIR /usr/src/app

COPY package.json bun.lockb ./ 
COPY packages/ripple-client ./packages/ripple-client
COPY packages/launchpad-dashboard ./packages/launchpad-dashboard

# 安裝依賴 (包含 Workspace 連結)
RUN bun install

# 構建 Dashboard
WORKDIR /usr/src/app/packages/launchpad-dashboard
RUN bun run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=build /usr/src/app/packages/launchpad-dashboard/dist /usr/share/nginx/html

# 配置 Nginx 支援 SPA 路由 (雖然 Dashboard 暫時只有一頁)
RUN echo 'server { 
    listen 80; 
    location / { 
        root /usr/share/nginx/html; 
        index index.html index.htm; 
        try_files $uri $uri/ /index.html; 
    } 
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
