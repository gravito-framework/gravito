import type { LinkProps } from '@inertiajs/react'
import { Link } from '@inertiajs/react'
import type React from 'react'

/**
 * 檢測是否在靜態網站環境中（GitHub Pages、Vercel、Netlify 等）
 * 在靜態環境中，沒有後端伺服器處理 Inertia 的 AJAX 請求，
 * 因此需要使用普通的 <a> 標籤進行完整頁面導航
 *
 * 注意：請根據您的實際生產環境域名更新 staticDomains 陣列
 */
function isStaticSite(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const hostname = window.location.hostname

  // 在此添加您的生產環境域名
  // 這些域名會被視為靜態網站環境
  const staticDomains = [
    'gravito.dev',
    // 如果需要，可以添加 GitHub Pages 模式
    // hostname.includes('github.io')
    // 或添加其他靜態託管平台
    // hostname.includes('vercel.app')
    // hostname.includes('netlify.app')
  ]

  return staticDomains.includes(hostname)
}

interface StaticLinkProps extends LinkProps {
  children: React.ReactNode
  className?: string
}

/**
 * 自定義 Link 組件，在靜態網站環境中使用普通的 <a> 標籤
 * 在開發環境或動態環境中使用 Inertia 的 Link 組件
 */
export function StaticLink({ href, children, className, onClick, ...props }: StaticLinkProps) {
  const isStatic = isStaticSite()

  if (isStatic) {
    // 在靜態環境中，使用普通的 <a> 標籤進行完整頁面導航
    // 這樣可以避免 Inertia 的 AJAX 請求在沒有後端的情況下失敗
    const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      // 如果提供了 onClick 處理器，先執行它
      if (onClick) {
        onClick(e as any)
      }
      // 在靜態環境中，讓瀏覽器處理導航（不阻止默認行為）
    }

    return (
      <a
        href={href as string}
        className={className}
        onClick={handleClick}
        {...(props as Omit<
          React.AnchorHTMLAttributes<HTMLAnchorElement>,
          'href' | 'className' | 'onClick'
        >)}
      >
        {children}
      </a>
    )
  }

  // 在動態環境中，使用 Inertia 的 Link 組件
  return (
    <Link href={href} className={className} onClick={onClick} {...props}>
      {children}
    </Link>
  )
}
