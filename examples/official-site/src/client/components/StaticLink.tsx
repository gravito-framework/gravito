import { Link } from '@inertiajs/react'
import type React from 'react'

/**
 * 檢測是否在靜態網站環境中（GitHub Pages、Vercel、Netlify 等）
 * 在靜態環境中，沒有後端伺服器處理 Inertia 的 AJAX 請求，
 * 因此需要使用普通的 <a> 標籤進行完整頁面導航
 *
 * 注意：請根據您的實際生產環境域名更新 staticDomains 陣列
 */
export function isStaticSite(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const hostname = window.location.hostname
  const port = window.location.port

  // 🔥 Static preview server detection:
  // Port 4173 is used by `bun run build:preview` which serves the compiled static files.
  // In this mode, there's no Inertia backend, so we must use regular <a> tags.
  if ((hostname === 'localhost' || hostname === '127.0.0.1') && port === '4173') {
    return true
  }

  // 🔥 Development mode with Inertia backend (port 3000/5173):
  // Using Inertia's <Link> allows for smooth SPA transitions.
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return false
  }

  // Production domains that should use hard reloads for safety on static CDNs
  const staticDomains = [
    'gravito.dev',
    'gravito-framework.github.io'
  ]

  return staticDomains.includes(hostname)
}

interface StaticLinkProps {
  href: string | undefined | null
  children: React.ReactNode
  className?: string
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
  [key: string]: any
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
    <Link href={href as any} className={className} onClick={onClick as any} {...props}>
      {children}
    </Link>
  )
}
