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
   * Load template, process includes, and replace {{key}} variables
   */
  private loadAndInterpolate(name: string, data: Record<string, any>): string {
    let template = this.readTemplate(name);
    // Process includes before variable interpolation
    template = this.processIncludes(template);
    // Process conditionals
    template = this.processConditionals(template, data);
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

  private processIncludes(template: string, depth = 0): string {
    if (depth > 10) {
      throw new Error('Maximum include depth exceeded');
    }

    // Match {{ include 'name' }} or {{ include "name" }}
    return template.replace(/\{\{\s*include\s+['"](.+?)['"]\s*\}\}/g, (_, partialName) => {
      const partialContent = this.readTemplate(partialName);
      // Recursively process includes in the partial
      return this.processIncludes(partialContent, depth + 1);
    });
  }

  private processConditionals(template: string, data: Record<string, any>): string {
    // Handle {{#if key}}...{{/if}}
    // note: does not support nested blocks of the same type gracefully with regex
    template = template.replace(
      /\{\{\s*#if\s+(\w+)\s*\}\}([\s\S]*?)\{\{\s*\/if\s*\}\}/g,
      (_, key, content) => {
        return data[key] ? content : '';
      }
    );

    // Handle {{#unless key}}...{{/unless}}
    template = template.replace(
      /\{\{\s*#unless\s+(\w+)\s*\}\}([\s\S]*?)\{\{\s*\/unless\s*\}\}/g,
      (_, key, content) => {
        return !data[key] ? content : '';
      }
    );

    return template;
  }

  private interpolate(template: string, data: Record<string, any>): string {
    return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
      return String(data[key] ?? '');
    });
  }
}
