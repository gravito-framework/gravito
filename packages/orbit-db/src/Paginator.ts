import type { PaginateResult } from './types'

/**
 * Paginator class to help with pagination UI and logic.
 */
export class Paginator<T> {
  constructor(
    public readonly items: T[],
    public readonly total: number,
    public readonly perPage: number,
    public readonly currentPage: number,
    private readonly baseUrl: string = '',
    private readonly query: Record<string, string | number> = {}
  ) {}

  /**
   * Get total number of pages.
   */
  get lastPage(): number {
    return Math.ceil(this.total / this.perPage)
  }

  /**
   * Check if there are more pages.
   */
  hasMorePages(): boolean {
    return this.currentPage < this.lastPage
  }

  /**
   * Get the URL for a specific page.
   */
  url(page: number): string {
    if (page < 1) page = 1
    if (page > this.lastPage) page = this.lastPage

    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(this.query)) {
      if (key !== 'page') {
        params.set(key, String(value))
      }
    }
    params.set('page', String(page))

    return `${this.baseUrl}?${params.toString()}`
  }

  /**
   * Get the URL for the next page.
   */
  nextPageUrl(): string | null {
    return this.hasMorePages() ? this.url(this.currentPage + 1) : null
  }

  /**
   * Get the URL for the previous page.
   */
  previousPageUrl(): string | null {
    return this.currentPage > 1 ? this.url(this.currentPage - 1) : null
  }

  /**
   * Convert to plain object (compatible with PaginateResult).
   */
  toResponse(): PaginateResult<T> {
    return {
      data: this.items,
      pagination: {
        page: this.currentPage,
        limit: this.perPage,
        total: this.total,
        totalPages: this.lastPage,
        hasNext: this.hasMorePages(),
        hasPrev: this.currentPage > 1,
      },
    }
  }
}
