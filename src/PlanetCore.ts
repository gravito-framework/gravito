import { Hono } from 'hono';
import { HookManager } from './HookManager';

export class PlanetCore {
  public app: Hono;
  public hooks: HookManager;

  constructor() {
    this.app = new Hono();
    this.hooks = new HookManager();

    // Add logger middleware for debugging
    this.app.use('*', async (c, next) => {
      console.log(`[PlanetCore] ${c.req.method} ${c.req.url}`);
      await next();
    });
  }

  /**
   * 掛載軌道 (Orbit)
   * 將外部的 Hono app 掛載到指定路徑
   */
  mountOrbit(path: string, orbitApp: Hono): void {
    this.app.route(path, orbitApp);
  }

  /**
   * 啟動核心 (Liftoff)
   * 回傳用於 Bun.serve 的設定物件
   */
  liftoff(port = 3000) {
    console.log(`[PlanetCore] Ready to liftoff on port ${port} 🚀`);

    return {
      port,
      fetch: this.app.fetch.bind(this.app),
    };
  }
}
