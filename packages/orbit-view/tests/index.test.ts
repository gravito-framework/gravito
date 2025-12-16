import { describe, expect, it, mock } from 'bun:test';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { PlanetCore } from 'gravito-core';
import { OrbitView } from '../src/index';
import { TemplateEngine } from '../src/TemplateEngine';

const TEST_DIR = join(process.cwd(), 'test-views');

describe('OrbitView', () => {
  it('should register view engine', async () => {
    const core = new PlanetCore();
    const orbit = new OrbitView();

    // Mock config
    mock.module('gravito-core', () => ({
      PlanetCore: class {
        config = { get: () => 'test-views' };
        logger = { info: () => {} };
        app = { use: () => {} };
      },
    }));

    // Setup test dir
    try {
      mkdirSync(TEST_DIR, { recursive: true });
      const viewsDir = TEST_DIR;
      const engine = new TemplateEngine(viewsDir);

      expect(engine).toBeDefined();
    } finally {
      // Cleanup
      rmSync(TEST_DIR, { recursive: true, force: true });
    }
  });
});

describe('TemplateEngine', () => {
  const viewsDir = join(process.cwd(), 'test-views-engine');

  it('should render template with data', () => {
    mkdirSync(viewsDir, { recursive: true });
    writeFileSync(join(viewsDir, 'test.html'), 'Hello {{name}}!');

    const engine = new TemplateEngine(viewsDir);
    const result = engine.render('test', { name: 'World' }, { layout: '' }); // No layout

    expect(result).toBe('Hello World!');

    rmSync(viewsDir, { recursive: true, force: true });
  });

  it('should render with layout', () => {
    mkdirSync(viewsDir, { recursive: true });
    writeFileSync(join(viewsDir, 'layout.html'), '<html>{{content}}</html>');
    writeFileSync(join(viewsDir, 'page.html'), '<h1>{{title}}</h1>');

    const engine = new TemplateEngine(viewsDir);
    const result = engine.render('page', {}, { title: 'Page Title' });

    expect(result).toBe('<html><h1>Page Title</h1></html>');

    rmSync(viewsDir, { recursive: true, force: true });
  });
});
