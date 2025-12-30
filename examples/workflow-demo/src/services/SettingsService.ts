import { AuthController } from '../controllers/AuthController'

type Settings = {
  theme: 'light' | 'dark'
  notifications: boolean
}

export class SettingsService {
  private store = new Map<string, Settings>()

  get(userId: string): Settings {
    if (!this.store.has(userId)) {
      this.store.set(userId, { theme: 'light', notifications: true })
    }
    return this.store.get(userId)!
  }

  update(userId: string, updates: Partial<Settings>): Settings {
    const current = this.get(userId)
    const next = { ...current, ...updates }
    this.store.set(userId, next)
    return next
  }
}
