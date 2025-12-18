import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

export interface RenderOptions {
  layout?: string
  scripts?: string
  title?: string
  [key: string]: unknown
}

/**
 * Helper 函數類型定義
 */
export type HelperFunction = (
  args: Record<string, string | number | boolean>,
  data: Record<string, unknown>
) => string

export class TemplateEngine {
  private cache = new Map<string, string>()
  private viewsDir: string
  private helpers = new Map<string, HelperFunction>()

  constructor(viewsDir: string) {
    this.viewsDir = viewsDir
  }

  /**
   * 註冊 helper 函數
   */
  public registerHelper(name: string, fn: HelperFunction): void {
    this.helpers.set(name, fn)
  }

  /**
   * 移除 helper 函數
   */
  public unregisterHelper(name: string): void {
    this.helpers.delete(name)
  }

  /**
   * Render a view with optional layout
   */
  public render(
    view: string,
    data: Record<string, unknown> = {},
    options: RenderOptions = {}
  ): string {
    const { layout = 'layout', ...layoutData } = options

    // 1. Render the main view
    // Merge options into data so they are available in the view too
    const viewContent = this.loadAndInterpolate(view, { ...data, ...layoutData })

    // 2. If no layout, return view content
    if (!layout) {
      return viewContent
    }

    // 3. Render the layout with injected content
    // We merge data into layout so it can access variables too
    return this.loadAndInterpolate(layout, {
      ...data,
      ...layoutData,
      content: viewContent,
    })
  }

  /**
   * Load template, process includes, and replace {{key}} variables
   */
  private loadAndInterpolate(name: string, data: Record<string, unknown>): string {
    let template = this.readTemplate(name)

    // 1. Process Includes (Recursive)
    template = this.processIncludes(template)

    // 2. Process Loops (Handle arrays)
    template = this.processLoops(template, data)

    // 3. Process Conditionals (Handle if/else/unless)
    template = this.processConditionals(template, data)

    // 4. Process Helpers (Handle {{helper arg1=value1 arg2=value2}})
    template = this.processHelpers(template, data)

    // 5. Interpolate Variables (Final pass)
    return this.interpolate(template, data)
  }

  private readTemplate(name: string): string {
    const cached = this.cache.get(name)
    if (cached !== undefined) {
      return cached
    }

    const path = resolve(this.viewsDir, `${name}.html`)

    if (!existsSync(path)) {
      throw new Error(`View not found: ${path}`)
    }

    const content = readFileSync(path, 'utf-8')

    if (process.env.NODE_ENV === 'production') {
      this.cache.set(name, content)
    }

    return content
  }

  private processIncludes(template: string, depth = 0): string {
    if (depth > 10) {
      throw new Error('Maximum include depth exceeded')
    }

    return template.replace(/\{\{\s*include\s+['"](.+?)['"]\s*\}\}/g, (_, partialName) => {
      const partialContent = this.readTemplate(partialName)
      return this.processIncludes(partialContent, depth + 1)
    })
  }

  private processLoops(template: string, data: Record<string, unknown>): string {
    // Match {{#each items}}...{{/each}}
    return template.replace(
      /\{\{\s*#each\s+([\w.]+)\s*\}\}([\s\S]*?)\{\{\s*\/each\s*\}\}/g,
      (_, key, content) => {
        const items = this.getNestedValue(data, key)

        if (!Array.isArray(items) || items.length === 0) {
          return ''
        }

        return items
          .map((item) => {
            // If item is primitive, use {{this}}
            // If item is object, merge it into data scope (simplified scope handling)
            const itemData =
              typeof item === 'object' && item !== null
                ? { ...data, ...(item as object), this: item }
                : { ...data, this: item }

            // Recursively process the inner content (for nested logic)
            let inner = content
            inner = this.processLoops(inner, itemData) // Nested loops
            inner = this.processConditionals(inner, itemData)
            inner = this.interpolate(inner, itemData)
            return inner
          })
          .join('')
      }
    )
  }

  private processConditionals(template: string, data: Record<string, unknown>): string {
    // Handle {{#if key}}...{{else}}...{{/if}} and {{#if key}}...{{/if}}
    let result = template.replace(
      /\{\{\s*#if\s+([\w.]+)\s*\}\}([\s\S]*?)(\{\{\s*else\s*\}\}([\s\S]*?))?\{\{\s*\/if\s*\}\}/g,
      (_, key, trueBlock, _elseGroup, falseBlock) => {
        const value = this.getNestedValue(data, key)
        return value ? trueBlock : falseBlock || ''
      }
    )

    // Handle {{#unless key}}...{{/unless}}
    result = result.replace(
      /\{\{\s*#unless\s+([\w.]+)\s*\}\}([\s\S]*?)\{\{\s*\/unless\s*\}\}/g,
      (_, key, content) => {
        const value = this.getNestedValue(data, key)
        return !value ? content : ''
      }
    )

    return result
  }

  /**
   * 處理 helper 函數調用
   * 語法：{{helper arg1=value1 arg2="value2" arg3=123}}
   */
  private processHelpers(template: string, data: Record<string, unknown>): string {
    // 匹配 {{helper arg1=value1 arg2="value2"}}
    // 不匹配已處理的變數插值（單一變數名）
    return template.replace(
      /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s+([^}]+)\s*\}\}/g,
      (match, helperName, argsString) => {
        // 檢查是否是已註冊的 helper
        const helper = this.helpers.get(helperName)
        if (!helper) {
          // 不是 helper，返回原樣（讓 interpolate 處理）
          return match
        }

        // 解析參數
        const args = this.parseHelperArgs(argsString)

        // 調用 helper 函數
        try {
          return helper(args, data)
        } catch (error) {
          console.error(`Error in helper "${helperName}":`, error)
          return ''
        }
      }
    )
  }

  /**
   * 解析 helper 函數參數
   * 支援：arg=value, arg="value", arg='value', arg=123, arg=true
   */
  private parseHelperArgs(argsString: string): Record<string, string | number | boolean> {
    const args: Record<string, string | number | boolean> = {}

    // 匹配 key=value 或 key="value" 或 key='value'
    const argPattern = /(\w+)\s*=\s*("([^"]*)"|'([^']*)'|(\d+\.?\d*)|(true|false)|([^\s}]+))/g
    let match: RegExpExecArray | null = argPattern.exec(argsString)

    while (match !== null) {
      const key = match[1]
      const doubleQuoted = match[3]
      const singleQuoted = match[4]
      const number = match[5]
      const booleanValue = match[6]
      const unquoted = match[7]

      if (doubleQuoted !== undefined) {
        args[key] = doubleQuoted
      } else if (singleQuoted !== undefined) {
        args[key] = singleQuoted
      } else if (number !== undefined) {
        args[key] = Number(number)
      } else if (booleanValue !== undefined) {
        args[key] = booleanValue === 'true'
      } else if (unquoted !== undefined) {
        args[key] = unquoted
      }
      match = argPattern.exec(argsString)
    }

    return args
  }

  private interpolate(template: string, data: Record<string, unknown>): string {
    // 1. Handle unescaped variables {{{ value }}}
    const result = template.replace(/\{\{\{\s*([\w.]+)\s*\}\}\}/g, (_, key) => {
      const value = this.getNestedValue(data, key)
      return String(value ?? '')
    })

    // 2. Handle escaped variables {{ value }}
    return result.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (_, key) => {
      const value = this.getNestedValue(data, key)
      return this.escapeHtml(String(value ?? ''))
    })
  }

  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }

  private getNestedValue(obj: unknown, path: string): unknown {
    return path.split('.').reduce((prev, curr) => {
      // @ts-expect-error: Dynamic access on unknown/any
      return prev ? prev[curr] : undefined
    }, obj)
  }
}
