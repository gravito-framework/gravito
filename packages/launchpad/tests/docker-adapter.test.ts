import { describe, expect, test } from 'bun:test'
import { DockerAdapter } from '../src/Infrastructure/Docker/DockerAdapter'

const makeStream = (text: string) => new Response(text).body as ReadableStream

function makeProcess(stdoutText: string, stderrText: string, exitCode = 0) {
  return {
    stdout: makeStream(stdoutText),
    stderr: makeStream(stderrText),
    exitCode,
    exited: Promise.resolve(exitCode),
  }
}

describe('DockerAdapter', () => {
  test('creates base container when stdout has container id', async () => {
    const adapter = new DockerAdapter()
    const originalSpawn = Bun.spawn
    const containerId = 'a'.repeat(64)

    Bun.spawn = () => makeProcess(containerId, '', 1) as any

    try {
      const result = await adapter.createBaseContainer()
      expect(result).toBe(containerId)
    } finally {
      Bun.spawn = originalSpawn
    }
  })

  test('throws when container creation fails', async () => {
    const adapter = new DockerAdapter()
    const originalSpawn = Bun.spawn

    Bun.spawn = () => makeProcess('bad', 'boom', 1) as any

    try {
      await expect(adapter.createBaseContainer()).rejects.toThrow('boom')
    } finally {
      Bun.spawn = originalSpawn
    }
  })

  test('copyFiles throws on non-zero exit code', async () => {
    const adapter = new DockerAdapter()
    const originalSpawn = Bun.spawn

    Bun.spawn = () => makeProcess('', 'copy failed', 1) as any

    try {
      await expect(adapter.copyFiles('cid', '/src', '/target')).rejects.toThrow('copy failed')
    } finally {
      Bun.spawn = originalSpawn
    }
  })

  test('executeCommand returns stdout and stderr', async () => {
    const adapter = new DockerAdapter()
    const originalSpawn = Bun.spawn

    Bun.spawn = () => makeProcess('ok', 'warn', 0) as any

    try {
      const result = await adapter.executeCommand('cid', ['echo', 'ok'])
      expect(result.stdout).toBe('ok')
      expect(result.stderr).toBe('warn')
      expect(result.exitCode).toBe(0)
    } finally {
      Bun.spawn = originalSpawn
    }
  })

  test('getStats parses cpu and memory output', async () => {
    const adapter = new DockerAdapter()
    const originalSpawn = Bun.spawn

    Bun.spawn = () => makeProcess('12%,10MiB / 20MiB', '', 0) as any

    try {
      const stats = await adapter.getStats('cid')
      expect(stats.cpu).toBe('12%')
      expect(stats.memory).toBe('10MiB / 20MiB')
    } finally {
      Bun.spawn = originalSpawn
    }
  })

  test('streamLogs forwards stdout and stderr', async () => {
    const adapter = new DockerAdapter()
    const originalSpawn = Bun.spawn

    Bun.spawn = () =>
      ({
        stdout: makeStream('out'),
        stderr: makeStream('err'),
        exited: Promise.resolve(),
      }) as any

    try {
      const logs: string[] = []
      adapter.streamLogs('cid', (data) => logs.push(data))

      await new Promise((resolve) => setTimeout(resolve, 0))
      expect(logs.join('')).toContain('out')
      expect(logs.join('')).toContain('err')
    } finally {
      Bun.spawn = originalSpawn
    }
  })
})
