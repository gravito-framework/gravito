/**
 * ImageService - 核心圖片處理服務
 *
 * 負責生成優化的圖片標籤，符合 Core Web Vitals 標準
 * - 生成響應式 srcset
 * - 處理圖片路徑正規化
 * - 確保無障礙性和效能優化
 */

export interface ImageOptions {
  src: string
  width?: number
  height?: number
  alt: string
  loading?: 'lazy' | 'eager'
  sizes?: string
  srcset?: boolean | number[]
  class?: string
  style?: string
  decoding?: 'async' | 'auto' | 'sync'
  fetchpriority?: 'high' | 'low' | 'auto'
}

export class ImageService {
  /**
   * 生成完整的 <img> 標籤 HTML
   */
  public generateImageTag(options: ImageOptions): string {
    const {
      src,
      width,
      height,
      alt,
      loading = 'lazy',
      sizes,
      srcset: srcsetOption,
      class: className,
      style,
      decoding = 'async',
      fetchpriority,
    } = options

    // 驗證必要屬性
    if (!alt || alt.trim() === '') {
      throw new Error('Image alt attribute is required for accessibility')
    }

    // 正規化圖片路徑
    const normalizedSrc = this.normalizePath(src)

    // 生成屬性陣列
    const attributes: string[] = []

    // 必要屬性
    attributes.push(`src="${this.escapeHtml(normalizedSrc)}"`)
    attributes.push(`alt="${this.escapeHtml(alt)}"`)

    // 寬高屬性（防止 CLS）
    if (width !== undefined) {
      attributes.push(`width="${width}"`)
    }
    if (height !== undefined) {
      attributes.push(`height="${height}"`)
    }

    // 懶加載
    attributes.push(`loading="${loading}"`)

    // 解碼方式
    attributes.push(`decoding="${decoding}"`)

    // 優先級（用於 LCP 優化）
    if (fetchpriority) {
      attributes.push(`fetchpriority="${fetchpriority}"`)
    }

    // 生成 srcset（如果啟用）
    if (srcsetOption !== false && width !== undefined) {
      const widths = Array.isArray(srcsetOption)
        ? srcsetOption
        : this.generateDefaultSrcsetWidths(width)
      const srcsetValue = this.generateSrcset(normalizedSrc, widths)
      if (srcsetValue) {
        attributes.push(`srcset="${srcsetValue}"`)
      }
    }

    // sizes 屬性（響應式圖片）
    if (sizes) {
      attributes.push(`sizes="${this.escapeHtml(sizes)}"`)
    } else if (srcsetOption !== false && width !== undefined) {
      // 預設 sizes（如果提供 width 且啟用 srcset）
      attributes.push(`sizes="(max-width: ${width}px) 100vw, ${width}px"`)
    }

    // 可選屬性
    if (className) {
      attributes.push(`class="${this.escapeHtml(className)}"`)
    }
    if (style) {
      attributes.push(`style="${this.escapeHtml(style)}"`)
    }

    return `<img ${attributes.join(' ')} />`
  }

  /**
   * 生成 srcset 字串
   *
   * @param src - 原始圖片路徑
   * @param widths - 寬度陣列（例如 [400, 800, 1200]）
   * @returns srcset 字串，例如 "image-400w.jpg 400w, image-800w.jpg 800w"
   */
  public generateSrcset(src: string, widths: number[]): string {
    if (widths.length === 0) {
      return ''
    }

    // 如果只有一個寬度，不需要 srcset
    if (widths.length === 1) {
      return ''
    }

    // 生成 srcset 項目
    const srcsetItems = widths.map((width) => {
      const srcWithWidth = this.addWidthToPath(src, width)
      return `${srcWithWidth} ${width}w`
    })

    return srcsetItems.join(', ')
  }

  /**
   * 生成預設的 srcset 寬度陣列
   * 基於原始寬度生成 1x, 1.5x, 2x 版本
   */
  private generateDefaultSrcsetWidths(baseWidth: number): number[] {
    const widths = new Set<number>()

    // 添加原始寬度
    widths.add(baseWidth)

    // 添加 1.5x 版本（如果合理）
    const width15x = Math.round(baseWidth * 1.5)
    if (width15x <= baseWidth * 2) {
      widths.add(width15x)
    }

    // 添加 2x 版本
    widths.add(baseWidth * 2)

    // 添加較小版本（用於響應式）
    if (baseWidth >= 800) {
      widths.add(400)
      widths.add(800)
    } else if (baseWidth >= 400) {
      widths.add(400)
    }

    // 排序並返回
    return Array.from(widths).sort((a, b) => a - b)
  }

  /**
   * 在圖片路徑中添加寬度標記
   * 例如：/static/hero.jpg -> /static/hero-800w.jpg
   *
   * 注意：這是簡化實作，實際應用中可能需要更複雜的路徑處理
   */
  private addWidthToPath(src: string, width: number): string {
    // 如果已經是完整 URL，直接返回（不修改外部 URL）
    if (src.startsWith('http://') || src.startsWith('https://')) {
      return src
    }

    // 分離路徑和副檔名
    const lastDotIndex = src.lastIndexOf('.')
    if (lastDotIndex === -1) {
      // 沒有副檔名，直接添加寬度
      return `${src}-${width}w`
    }

    const pathWithoutExt = src.substring(0, lastDotIndex)
    const extension = src.substring(lastDotIndex)

    return `${pathWithoutExt}-${width}w${extension}`
  }

  /**
   * 正規化圖片路徑
   * - 確保以 / 開頭（相對路徑）
   * - 處理 ../ 和 ./ 路徑
   */
  public normalizePath(src: string): string {
    // 如果是完整 URL，直接返回
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//')) {
      return src
    }

    // 確保以 / 開頭
    if (!src.startsWith('/')) {
      return `/${src}`
    }

    return src
  }

  /**
   * HTML 轉義
   */
  private escapeHtml(unsafe: string): string {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
  }
}
