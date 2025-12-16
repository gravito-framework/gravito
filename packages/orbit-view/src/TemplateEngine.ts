import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

export interface RenderOptions {
  layout?: string;
  scripts?: string;
  title?: string;
  [key: string]: any;
}

export class TemplateEngine {
  private cache = new Map<string, string>();
  private viewsDir: string;

  constructor(viewsDir: string) {
    this.viewsDir = viewsDir;
  }

  /**
   * Render a view with optional layout
   */
  public render(view: string, data: Record<string, any> = {}, options: RenderOptions = {}): string {
    const { layout = 'layout', ...layoutData } = options;

    // 1. Render the main view
    // Merge options into data so they are available in the view too
    const viewContent = this.loadAndInterpolate(view, { ...data, ...layoutData });

    // 2. If no layout, return view content
    if (!layout) {
      return viewContent;
    }

    // 3. Render the layout with injected content
    // We merge data into layout so it can access variables too
    return this.loadAndInterpolate(layout, {
      ...data,
      ...layoutData,
      content: viewContent,
    });
  }

  /**
   * Load template and replace {{key}} variables
   */
  private loadAndInterpolate(name: string, data: Record<string, any>): string {
    const template = this.readTemplate(name);
    return this.interpolate(template, data);
  }

  private readTemplate(name: string): string {
    if (this.cache.has(name)) {
      return this.cache.get(name)!;
    }

    // Try finding the file
    // We strictly assume .html for now as per original design
    const path = resolve(this.viewsDir, `${name}.html`);

    if (!existsSync(path)) {
      throw new Error(`View not found: ${path}`);
    }

    const content = readFileSync(path, 'utf-8');

    // Cache it (simple memory cache)
    // TODO: In development mode, we might want to disable cache
    if (process.env.NODE_ENV === 'production') {
      this.cache.set(name, content);
    }

    return content;
  }

  private interpolate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
      return String(data[key] ?? '');
    });
  }
}
