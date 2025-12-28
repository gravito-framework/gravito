import { describe, expect, mock, test } from 'bun:test'

let answers: string[] = []
const questionMock = mock(() => answers.shift() ?? '')
const closeMock = mock(() => {})

const writeFileMock = mock(async () => {})
const mkdirMock = mock(async () => {})
const existsSyncMock = mock(() => false)

mock.module('node:readline/promises', () => ({
  createInterface: () => ({
    question: questionMock,
    close: closeMock,
  }),
}))

mock.module('node:fs/promises', () => ({
  mkdir: mkdirMock,
  writeFile: writeFileMock,
}))

mock.module('node:fs', () => ({
  existsSync: existsSyncMock,
}))

class FakeIncrementalStrategy {
  compact = mock(async () => {})
}

class FakeEngine {
  constructor(private config: any) {}
  async init() {}
  getStrategy() {
    return this.config.strategy
  }
}

let entriesMode: 'array' | 'async' | 'batch' = 'array'
let loaderMode: 'incremental' | 'cached' = 'incremental'
let loaderShouldThrow = false
let strategyKind: 'entries' | 'incremental' = 'entries'

class FakeConfigLoader {
  async load() {
    if (loaderShouldThrow) {
      throw new Error('loader failed')
    }

    const entriesStrategy = {
      async getEntries() {
        if (entriesMode === 'async') {
          async function* gen() {
            yield { url: '/a' }
            yield { url: '/b' }
          }
          return gen()
        }

        if (entriesMode === 'batch') {
          async function* gen() {
            for (let i = 0; i < 1000; i++) {
              yield { url: `/item-${i}` }
            }
          }
          return gen()
        }

        return [{ url: '/one' }, { url: '/two' }]
      },
    }

    const strategy =
      strategyKind === 'incremental' ? new FakeIncrementalStrategy() : entriesStrategy

    return {
      mode: loaderMode,
      baseUrl: 'https://example.com',
      output: { path: './public', filename: 'sitemap.xml' },
      strategy,
    }
  }
}

class FakeXmlStreamBuilder {
  start() {
    return '<urlset>'
  }
  entry(entry: any) {
    return `<url>${entry.url}</url>`
  }
  end() {
    return '</urlset>'
  }
  buildFull(entries: any[]) {
    return `<urlset>${entries.map((e) => `<url>${e.url}</url>`).join('')}</urlset>`
  }
}

mock.module('@gravito/luminosity', () => ({
  ConfigLoader: FakeConfigLoader,
  SeoEngine: FakeEngine,
  XmlStreamBuilder: FakeXmlStreamBuilder,
  IncrementalStrategy: FakeIncrementalStrategy,
}))

const { compactCommand } = await import('../src/commands/compact')
const { generateCommand } = await import('../src/commands/generate')
const { initCommand } = await import('../src/commands/init')
const { progressCommand } = await import('../src/commands/progress')

describe('luminosity-cli commands', () => {
  test('compactCommand runs incremental compaction', async () => {
    loaderMode = 'incremental'
    strategyKind = 'incremental'
    await compactCommand({})
  })

  test('compactCommand exits when mode is not incremental', async () => {
    loaderMode = 'cached'
    strategyKind = 'incremental'

    const originalExit = process.exit
    process.exit = ((code?: number) => {
      throw new Error(`exit:${code ?? 0}`)
    }) as any

    try {
      await expect(compactCommand({})).rejects.toThrow('exit:1')
    } finally {
      process.exit = originalExit
    }
  })

  test('compactCommand exits on loader error', async () => {
    loaderShouldThrow = true

    const originalExit = process.exit
    process.exit = ((code?: number) => {
      throw new Error(`exit:${code ?? 0}`)
    }) as any

    try {
      await expect(compactCommand({})).rejects.toThrow('exit:1')
    } finally {
      loaderShouldThrow = false
      process.exit = originalExit
    }
  })

  test('generateCommand writes XML for array entries', async () => {
    loaderMode = 'incremental'
    strategyKind = 'entries'
    await generateCommand({})
    expect(writeFileMock).toHaveBeenCalled()
  })

  test('generateCommand streams async entries', async () => {
    entriesMode = 'async'
    await generateCommand({ out: 'tmp/sitemap.xml' })
    expect(writeFileMock).toHaveBeenCalled()
  })

  test('generateCommand handles background mode', async () => {
    entriesMode = 'array'
    await generateCommand({ background: true })
    expect(writeFileMock).toHaveBeenCalled()
  })

  test('generateCommand streams batch entries', async () => {
    entriesMode = 'batch'
    await generateCommand({ out: 'tmp/batch.xml' })
    expect(writeFileMock).toHaveBeenCalled()
  })

  test('generateCommand exits on loader error', async () => {
    loaderShouldThrow = true

    const originalExit = process.exit
    process.exit = ((code?: number) => {
      throw new Error(`exit:${code ?? 0}`)
    }) as any

    try {
      await expect(generateCommand({})).rejects.toThrow('exit:1')
    } finally {
      loaderShouldThrow = false
      process.exit = originalExit
    }
  })

  test('progressCommand logs hints', async () => {
    const logSpy = mock(() => {})
    const originalLog = console.log
    console.log = logSpy

    try {
      await progressCommand({ jobId: 'job-1' })
      expect(logSpy).toHaveBeenCalled()
    } finally {
      console.log = originalLog
    }
  })

  test('progressCommand exits on logging error', async () => {
    const originalLog = console.log
    console.log = () => {
      throw new Error('log failed')
    }

    const originalExit = process.exit
    process.exit = ((code?: number) => {
      throw new Error(`exit:${code ?? 0}`)
    }) as any

    try {
      await expect(progressCommand({ jobId: 'job-2' })).rejects.toThrow('exit:1')
    } finally {
      console.log = originalLog
      process.exit = originalExit
    }
  })

  test('initCommand writes config file', async () => {
    answers = ['https://example.com/', '']
    existsSyncMock.mockImplementation(() => false)

    await initCommand()
    expect(writeFileMock).toHaveBeenCalled()
  })

  test('initCommand exits when config exists', async () => {
    answers = ['https://example.com/', '']
    existsSyncMock.mockImplementation(() => true)

    const originalExit = process.exit
    process.exit = ((code?: number) => {
      throw new Error(`exit:${code ?? 0}`)
    }) as any

    try {
      await expect(initCommand()).rejects.toThrow('exit:1')
    } finally {
      process.exit = originalExit
    }
  })
})
