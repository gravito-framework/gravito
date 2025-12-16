import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import type { PlanetCore } from 'gravito-core';
import type { Context, Next } from 'hono';

export interface StorageProvider {
  put(key: string, data: Blob | Buffer | string): Promise<void>;
  get(key: string): Promise<Blob | null>;
  delete(key: string): Promise<void>;
  getUrl(key: string): string;
}

export class LocalStorageProvider implements StorageProvider {
  private rootDir: string;
  private baseUrl: string;

  constructor(rootDir: string, baseUrl = '/storage') {
    this.rootDir = rootDir;
    this.baseUrl = baseUrl;
  }

  async put(key: string, data: Blob | Buffer | string): Promise<void> {
    const path = join(this.rootDir, key);
    // Ensure dir exists
    const dir = path.substring(0, path.lastIndexOf('/'));
    if (dir && dir !== this.rootDir) {
      await mkdir(dir, { recursive: true });
    }
    await Bun.write(path, data);
  }

  async get(key: string): Promise<Blob | null> {
    const file = Bun.file(join(this.rootDir, key));
    if (!(await file.exists())) return null;
    return file;
  }

  async delete(key: string): Promise<void> {
    // Bun currently lacks a direct 'unlink' API in Bun.file, using fs/promises is safer for checking
    // But actually, Node COMPAT layer is preferred.
    // Or just use shell for "rm"? No, unsafe.
    // Let's use simple node:fs for deletion.
    const fs = await import('node:fs/promises');
    try {
      await fs.unlink(join(this.rootDir, key));
    } catch (e) {
      // Ignore if not found
    }
  }

  getUrl(key: string): string {
    return `${this.baseUrl}/${key}`;
  }
}

export interface OrbitStorageOptions {
  provider?: StorageProvider;
  exposeAs?: string; // Default: 'storage'
  local?: {
    root: string;
    baseUrl?: string;
  };
}

export default function orbitStorage(core: PlanetCore, options: OrbitStorageOptions) {
  const { exposeAs = 'storage' } = options;
  const logger = core.logger;

  logger.info(`[OrbitStorage] Initializing Storage (Exposed as: ${exposeAs})`);

  let provider = options.provider;

  // Default to LocalStorage if not provided and local options are present
  if (!provider && options.local) {
    logger.info(`[OrbitStorage] Using LocalStorageProvider at ${options.local.root}`);
    provider = new LocalStorageProvider(options.local.root, options.local.baseUrl);
  }

  if (!provider) {
    throw new Error(
      '[OrbitStorage] No provider configured. Please provide a provider instance or local configuration.'
    );
  }

  const storageService = {
    ...provider,
    // Wrap methods if we want to add hooks later
    put: async (key: string, data: Blob | Buffer | string) => {
      // Hook: storage:upload
      const finalData = await core.hooks.applyFilters('storage:upload', data, { key });
      await provider?.put(key, finalData);
      // Action: storage:uploaded
      await core.hooks.doAction('storage:uploaded', { key });
    },
  };

  // Inject helper into context
  core.app.use('*', async (c: Context, next: Next) => {
    c.set(exposeAs, storageService);
    await next();
  });

  // Action: Storage Initialized
  core.hooks.doAction('storage:init', storageService);

  return storageService;
}
