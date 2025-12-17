import type { PlanetCore } from 'gravito-core';
import type { Context } from 'hono';
import { SitemapStream } from './core/SitemapStream';
import type { SitemapProvider, SitemapStreamOptions } from './types';

export interface DynamicSitemapOptions extends SitemapStreamOptions {
  path?: string | undefined; // default: '/sitemap.xml'
  providers: SitemapProvider[];
  cacheSeconds?: number | undefined;
}

export interface StaticSitemapOptions extends SitemapStreamOptions {
  outDir: string;
  filename?: string | undefined; // default: 'sitemap.xml'
  providers: SitemapProvider[];
}

export class OrbitSitemap {
  private options: DynamicSitemapOptions | StaticSitemapOptions;
  private mode: 'dynamic' | 'static';

  private constructor(mode: 'dynamic' | 'static', options: any) {
    this.mode = mode;
    this.options = options;
  }

  static dynamic(options: DynamicSitemapOptions): OrbitSitemap {
    return new OrbitSitemap('dynamic', {
      path: '/sitemap.xml',
      ...options,
    });
  }

  static static(options: StaticSitemapOptions): OrbitSitemap {
    return new OrbitSitemap('static', {
      filename: 'sitemap.xml',
      ...options,
    });
  }

  install(core: PlanetCore): void {
    if (this.mode === 'dynamic') {
      this.installDynamic(core);
    } else {
      // Static generation is usually triggered via a build script,
      // but we can also expose a route to trigger it or just log usage.
      console.log('[OrbitSitemap] Static mode configured. Use generate() to build sitemaps.');
    }
  }

  private installDynamic(core: PlanetCore) {
    const opts = this.options as DynamicSitemapOptions;

    core.router.get(opts.path!, async (ctx: Context) => {
      const stream = new SitemapStream({
        baseUrl: opts.baseUrl,
        pretty: opts.pretty,
      });

      for (const provider of opts.providers) {
        const entries = await provider.getEntries();
        stream.addAll(entries);
      }

      const xml = stream.toXML();

      return ctx.body(xml, 200, {
        'Content-Type': 'application/xml',
        'Cache-Control': opts.cacheSeconds ? `public, max-age=${opts.cacheSeconds}` : 'no-cache',
      });
    });
  }

  async generate(): Promise<void> {
    if (this.mode !== 'static') {
      throw new Error('generate() can only be called in static mode');
    }

    const opts = this.options as StaticSitemapOptions;
    // In a real implementation, we would write to file system here.
    // Since we don't want to bring in 'fs' dependency into the browser bundle if possible,
    // we assume this runs in Node/Bun environment.

    const stream = new SitemapStream({
      baseUrl: opts.baseUrl,
      pretty: opts.pretty,
    });

    for (const provider of opts.providers) {
      const entries = await provider.getEntries();
      stream.addAll(entries);
    }

    const xml = stream.toXML();

    const fs = await import('node:fs/promises');
    const path = await import('node:path');

    const filePath = path.join(opts.outDir, opts.filename!);
    await fs.mkdir(opts.outDir, { recursive: true });
    await fs.writeFile(filePath, xml);

    console.log(`[OrbitSitemap] Generated ${filePath}`);
  }
}
