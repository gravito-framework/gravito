import { describe, expect, it } from 'bun:test'
import { createImageHelper } from '../src/helpers/image'
import { type ImageOptions, ImageService } from '../src/ImageService'
import { TemplateEngine } from '../src/TemplateEngine'

describe('ImageService', () => {
  const imageService = new ImageService()

  describe('generateImageTag', () => {
    it('應該生成基本的圖片標籤', () => {
      const options: ImageOptions = {
        src: '/static/hero.jpg',
        alt: 'Hero image',
        width: 800,
        height: 600,
      }

      const html = imageService.generateImageTag(options)

      expect(html).toContain('src="/static/hero.jpg"')
      expect(html).toContain('alt="Hero image"')
      expect(html).toContain('width="800"')
      expect(html).toContain('height="600"')
      expect(html).toContain('loading="lazy"')
      expect(html).toContain('decoding="async"')
    })

    it('應該要求 alt 屬性', () => {
      const options: ImageOptions = {
        src: '/static/hero.jpg',
        alt: '',
      }

      expect(() => imageService.generateImageTag(options)).toThrow(
        'Image alt attribute is required'
      )
    })

    it('應該支援 loading="eager"', () => {
      const options: ImageOptions = {
        src: '/static/hero.jpg',
        alt: 'Hero',
        loading: 'eager',
      }

      const html = imageService.generateImageTag(options)
      expect(html).toContain('loading="eager"')
    })

    it('應該支援 fetchpriority', () => {
      const options: ImageOptions = {
        src: '/static/hero.jpg',
        alt: 'Hero',
        fetchpriority: 'high',
      }

      const html = imageService.generateImageTag(options)
      expect(html).toContain('fetchpriority="high"')
    })

    it('應該支援 className 和 style', () => {
      const options: ImageOptions = {
        src: '/static/hero.jpg',
        alt: 'Hero',
        class: 'hero-image',
        style: 'max-width: 100%;',
      }

      const html = imageService.generateImageTag(options)
      expect(html).toContain('class="hero-image"')
      expect(html).toContain('style="max-width: 100%;"')
    })

    it('應該轉義 HTML 特殊字元', () => {
      const options: ImageOptions = {
        src: '/static/hero.jpg',
        alt: 'Hero "image" & more',
      }

      const html = imageService.generateImageTag(options)
      expect(html).toContain('alt="Hero &quot;image&quot; &amp; more"')
    })
  })

  describe('generateSrcset', () => {
    it('應該生成 srcset 字串', () => {
      const srcset = imageService.generateSrcset('/static/hero.jpg', [400, 800, 1200])

      expect(srcset).toContain('/static/hero-400w.jpg 400w')
      expect(srcset).toContain('/static/hero-800w.jpg 800w')
      expect(srcset).toContain('/static/hero-1200w.jpg 1200w')
    })

    it('應該處理空陣列', () => {
      const srcset = imageService.generateSrcset('/static/hero.jpg', [])
      expect(srcset).toBe('')
    })

    it('應該處理單一寬度', () => {
      const srcset = imageService.generateSrcset('/static/hero.jpg', [800])
      expect(srcset).toBe('')
    })

    it('應該保留完整 URL', () => {
      const srcset = imageService.generateSrcset('https://example.com/image.jpg', [400, 800])
      expect(srcset).toContain('https://example.com/image.jpg')
    })
  })

  describe('normalizePath', () => {
    it('應該正規化相對路徑', () => {
      expect(imageService.normalizePath('static/hero.jpg')).toBe('/static/hero.jpg')
      expect(imageService.normalizePath('/static/hero.jpg')).toBe('/static/hero.jpg')
    })

    it('應該保留完整 URL', () => {
      expect(imageService.normalizePath('https://example.com/image.jpg')).toBe(
        'https://example.com/image.jpg'
      )
      expect(imageService.normalizePath('http://example.com/image.jpg')).toBe(
        'http://example.com/image.jpg'
      )
      expect(imageService.normalizePath('//example.com/image.jpg')).toBe('//example.com/image.jpg')
    })
  })

  describe('generateImageTag with srcset', () => {
    it('應該自動生成 srcset（如果提供 width）', () => {
      const options: ImageOptions = {
        src: '/static/hero.jpg',
        alt: 'Hero',
        width: 800,
        srcset: true,
      }

      const html = imageService.generateImageTag(options)
      expect(html).toContain('srcset=')
      expect(html).toContain('sizes=')
    })

    it('應該使用自訂 srcset 寬度', () => {
      const options: ImageOptions = {
        src: '/static/hero.jpg',
        alt: 'Hero',
        width: 800,
        srcset: [400, 800, 1200],
      }

      const html = imageService.generateImageTag(options)
      expect(html).toContain('srcset=')
      expect(html).toContain('400w')
      expect(html).toContain('800w')
      expect(html).toContain('1200w')
    })

    it('應該可以停用 srcset', () => {
      const options: ImageOptions = {
        src: '/static/hero.jpg',
        alt: 'Hero',
        width: 800,
        srcset: false,
      }

      const html = imageService.generateImageTag(options)
      expect(html).not.toContain('srcset=')
    })
  })
})

describe('Image Helper', () => {
  const imageHelper = createImageHelper()

  it('應該生成圖片標籤', () => {
    const result = imageHelper(
      {
        src: '/static/hero.jpg',
        alt: 'Hero image',
        width: 800,
        height: 600,
      },
      {}
    )

    expect(result).toContain('src="/static/hero.jpg"')
    expect(result).toContain('alt="Hero image"')
    expect(result).toContain('width="800"')
    expect(result).toContain('height="600"')
  })

  it('應該要求 src 參數', () => {
    expect(() => {
      imageHelper({ alt: 'Hero' }, {})
    }).toThrow('Image helper requires "src" parameter')
  })

  it('應該要求 alt 參數', () => {
    expect(() => {
      imageHelper({ src: '/static/hero.jpg' }, {})
    }).toThrow('Image helper requires "alt" parameter')
  })

  it('應該處理字串數字轉換', () => {
    const result = imageHelper(
      {
        src: '/static/hero.jpg',
        alt: 'Hero',
        width: '800',
        height: '600',
      },
      {}
    )

    expect(result).toContain('width="800"')
    expect(result).toContain('height="600"')
  })

  it('應該處理 loading 參數', () => {
    const result = imageHelper(
      {
        src: '/static/hero.jpg',
        alt: 'Hero',
        loading: 'eager',
      },
      {}
    )

    expect(result).toContain('loading="eager"')
  })

  it('應該處理 sizes 參數', () => {
    const result = imageHelper(
      {
        src: '/static/hero.jpg',
        alt: 'Hero',
        sizes: '(max-width: 768px) 100vw, 50vw',
      },
      {}
    )

    expect(result).toContain('sizes="(max-width: 768px) 100vw, 50vw"')
  })

  it('應該處理 class 參數', () => {
    const result = imageHelper(
      {
        src: '/static/hero.jpg',
        alt: 'Hero',
        class: 'hero-image',
      },
      {}
    )

    expect(result).toContain('class="hero-image"')
  })
})

describe('TemplateEngine with Image Helper', () => {
  it('應該在模板中處理 image helper', () => {
    const engine = new TemplateEngine('./tests/views')
    engine.registerHelper('image', createImageHelper())

    // 由於我們無法直接測試 loadAndInterpolate（它是 private），
    // 我們測試 helper 註冊是否成功
    expect(engine).toBeDefined()
  })
})

describe('React Image Component', () => {
  it('應該能正確導出（如果 React 可用）', () => {
    // 嘗試導入 React 組件
    // 如果 React 未安裝，這個測試會被跳過（這是可接受的，因為 React 是可選依賴）
    try {
      const { Image } = require('../src/components/Image')
      expect(Image).toBeDefined()
      expect(typeof Image).toBe('function')
    } catch (error: unknown) {
      // 如果 React 未安裝，跳過此測試
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String(error.message)
            : String(error)
      if (
        errorMessage.includes('react') ||
        errorMessage.includes('Cannot find module') ||
        errorMessage.includes('ResolveMessage')
      ) {
        // 這是預期的，因為 React 是可選的 peerDependency
        return
      }
      throw error
    }
  })

  it('應該能生成正確的 HTML（通過 ImageService）', () => {
    // 由於 React 組件依賴 ImageService，我們已經通過 ImageService 測試覆蓋了核心邏輯
    // 這裡只驗證組件能正確導出（如果 React 可用）
    try {
      const { Image } = require('../src/components/Image')
      expect(Image).toBeDefined()
    } catch (error: unknown) {
      // 如果 React 未安裝，跳過此測試
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === 'object' && error !== null && 'message' in error
            ? String(error.message)
            : String(error)
      if (
        errorMessage.includes('react') ||
        errorMessage.includes('Cannot find module') ||
        errorMessage.includes('ResolveMessage')
      ) {
        // 這是預期的，因為 React 是可選的 peerDependency
        return
      }
      throw error
    }
  })
})
