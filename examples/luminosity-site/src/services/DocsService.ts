import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import matter from 'gray-matter'
import { marked } from 'marked'

const DOCS_ROOT = join(import.meta.dirname, '../../docs')

export interface DocPage {
  title: string
  content: string
  metadata: Record<string, unknown>
  toc: TocItem[]
}

export interface TocItem {
  id: string
  text: string
  level: number
}

export interface SidebarItem {
  title: string
  href?: string
  items?: SidebarItem[]
}

interface SidebarSection {
  title: string
  items: SidebarItem[]
}

class DocsServiceImpl {
  private highlighter: any = null

  async getHighlighter() {
    if (!this.highlighter) {
      const { createHighlighter } = await import('shiki')
      this.highlighter = await createHighlighter({
        themes: ['github-dark', 'github-light'],
        langs: ['typescript', 'javascript', 'bash', 'json', 'yaml', 'html', 'css'],
      })
    }
    return this.highlighter
  }

  async getDoc(slug: string, locale = 'en') {
    const filePath = join(process.cwd(), 'docs', locale, `${slug}.md`)

    try {
      const fileContent = await readFile(filePath, 'utf-8')
      const { data, content } = matter(fileContent)

      const highlighter = await this.getHighlighter()

      const html = await marked.parse(content, {
        // @ts-expect-error
        highlight: (code, lang) => {
          return highlighter.codeToHtml(code, { lang, theme: 'github-dark' })
        },
      })

      return {
        meta: data,
        content: html,
        slug,
        locale,
      }
    } catch (e) {
      console.error(`Error reading doc: ${filePath}`, e)
      return null
    }
  }

  static getSidebar(): SidebarItem[] {
    return [
      {
        title: 'Guide',
        path: '#',
        children: [
          { title: 'Introduction', path: '/docs/introduction' },
          { title: 'Getting Started', path: '/docs/getting-started' },
        ],
      },
    ]
  }
}
