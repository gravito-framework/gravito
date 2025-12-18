/**
 * 頻道基礎介面
 */
export interface Channel {
  /**
   * 頻道名稱
   */
  name: string

  /**
   * 頻道類型
   */
  type: 'public' | 'private' | 'presence'
}

/**
 * 公開頻道
 */
export class PublicChannel implements Channel {
  type = 'public' as const

  constructor(public name: string) {}
}

/**
 * 私有頻道
 */
export class PrivateChannel implements Channel {
  type = 'private' as const

  constructor(public name: string) {}
}

/**
 * 存在頻道（可追蹤線上使用者）
 */
export class PresenceChannel implements Channel {
  type = 'presence' as const

  constructor(public name: string) {}
}

