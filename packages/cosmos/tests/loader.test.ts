import { describe, expect, it, jest } from 'bun:test'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { loadTranslations } from '../src/loader'

describe('loadTranslations', () => {
  it('loads json translation files from a directory', async () => {
    const tmpDir = join(process.cwd(), 'tests', '.tmp-i18n')
    await rm(tmpDir, { force: true, recursive: true })
    await mkdir(tmpDir, { recursive: true })

    try {
      await writeFile(join(tmpDir, 'en.json'), JSON.stringify({ hello: 'Hello' }))
      await writeFile(join(tmpDir, 'zh.json'), JSON.stringify({ hello: '你好' }))

      const translations = await loadTranslations(tmpDir)

      expect(translations.en.hello).toBe('Hello')
      expect(translations.zh.hello).toBe('你好')
    } finally {
      await rm(tmpDir, { force: true, recursive: true })
    }
  })

  it('skips invalid json files and returns empty for missing dir', async () => {
    const tmpDir = join(process.cwd(), 'tests', '.tmp-i18n-invalid')
    await rm(tmpDir, { force: true, recursive: true })
    await mkdir(tmpDir, { recursive: true })

    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    try {
      await writeFile(join(tmpDir, 'en.json'), '{invalid json}')
      const translations = await loadTranslations(tmpDir)
      expect(translations.en).toBeUndefined()

      const missing = await loadTranslations(join(tmpDir, 'missing'))
      expect(missing).toEqual({})
    } finally {
      errorSpy.mockRestore()
      warnSpy.mockRestore()
      await rm(tmpDir, { force: true, recursive: true })
    }
  })
})
