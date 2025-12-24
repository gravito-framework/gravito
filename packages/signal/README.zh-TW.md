# Orbit Mail

> Gravito 的郵件模組，支援多種傳輸與 HTML/模板/React/Vue 渲染。

## 安裝

```bash
bun add @gravito/signal
```

## 快速開始

```typescript
import { OrbitSignal, SmtpTransport } from '@gravito/signal'

const mail = OrbitSignal.configure({
  from: { name: 'My App', address: 'noreply@myapp.com' },
  transport: new SmtpTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: { user: '...', pass: '...' }
  }),
  devMode: process.env.NODE_ENV === 'development',
})

mail.install(core)
```
