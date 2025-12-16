import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const viewsDir = resolve(__dirname, '../views');

// Simple template cache
const templateCache = new Map<string, string>();

/**
 * Read and cache a template file
 */
function readTemplate(name: string): string {
  if (templateCache.has(name)) {
    return templateCache.get(name)!;
  }

  const path = resolve(viewsDir, `${name}.html`);
  const content = readFileSync(path, 'utf-8');
  templateCache.set(name, content);
  return content;
}

/**
 * Simple mustache-style template interpolation
 * Replaces {{key}} with corresponding value from data object
 */
function interpolate(template: string, data: Record<string, string | number>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    return String(data[key] ?? '');
  });
}

/**
 * Render a view with layout
 */
export function render(
  view: string,
  data: Record<string, string | number> = {},
  options: {
    layout?: string;
    scripts?: string;
    title?: string;
  } = {}
): string {
  const { layout = 'layout', scripts = '', title = 'Gravito' } = options;

  // Load and interpolate the view content
  const viewTemplate = readTemplate(view);
  const content = interpolate(viewTemplate, data);

  // Load and interpolate the layout
  const layoutTemplate = readTemplate(layout);
  return interpolate(layoutTemplate, {
    title,
    content,
    scripts,
    ...data,
  });
}
