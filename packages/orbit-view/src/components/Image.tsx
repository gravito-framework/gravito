import type { ImageOptions } from '../ImageService'
import { ImageService } from '../ImageService'

/**
 * Image 組件 Props
 */
export interface ImageProps {
  src: string
  width?: number
  height?: number
  alt: string
  loading?: 'lazy' | 'eager'
  sizes?: string
  srcset?: boolean | number[]
  className?: string
  style?: string
  decoding?: 'async' | 'auto' | 'sync'
  fetchpriority?: 'high' | 'low' | 'auto'
}

/**
 * Image 組件 - 純服務端渲染
 *
 * 零客戶端依賴，所有邏輯在服務端執行
 * 使用 ImageService 生成優化的 <img> 標籤
 *
 * @example
 * ```tsx
 * <Image
 *   src="/static/hero.jpg"
 *   width={1920}
 *   height={1080}
 *   alt="Hero"
 *   loading="eager"
 * />
 * ```
 */
export function Image(props: ImageProps): JSX.Element {
  const imageService = new ImageService()

  // 轉換 React props 到 ImageOptions
  const options: ImageOptions = {
    src: props.src,
    alt: props.alt,
    width: props.width,
    height: props.height,
    loading: props.loading,
    sizes: props.sizes,
    srcset: props.srcset,
    class: props.className,
    style: props.style,
    decoding: props.decoding,
    fetchpriority: props.fetchpriority,
  }

  // 生成 HTML 標籤
  const html = imageService.generateImageTag(options)

  // 使用 dangerouslySetInnerHTML 渲染 HTML
  // 這是必要的，因為我們需要直接輸出完整的 <img> 標籤
  // 在服務端渲染時，這不會造成安全問題，因為所有內容都由 ImageService 控制
  // biome-ignore lint/security/noDangerouslySetInnerHtml: ImageService 控制所有輸出，確保安全
  return <span dangerouslySetInnerHTML={{ __html: html }} />
}

// 預設導出
export default Image
