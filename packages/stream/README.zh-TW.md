# @gravito/stream

> Gravito 的佇列模組，支援多種驅動與獨立 Worker。

## 安裝

```bash
bun add @gravito/stream
```

## 快速開始

```typescript
import { Job } from '@gravito/stream'

export class SendWelcomeEmail extends Job {
  constructor(private userId: string) {
    super()
  }

  async handle(): Promise<void> {
    const user = await User.find(this.userId)
    await mail.send(new WelcomeEmail(user))
  }
}
```

```typescript
const queue = c.get('queue')

await queue.push(new SendWelcomeEmail(user.id))
  .onQueue('emails')
  .delay(60)
```
