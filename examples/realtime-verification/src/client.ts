import { createRippleClient } from '@gravito/ripple-client'

export async function startClient(port: number, name: string) {
  console.log(`[${name}] Connecting to port ${port}...`)

  try {
    const client = createRippleClient({
      host: `ws://localhost:${port}/ws`,
      // Mock auth endpoint if needed, but we used authorizer: () => true in server
      authEndpoint: `http://localhost:${port}/broadcasting/auth`,
    })

    // In Bun/Node, we might need to ensure WebSocket is available if the client uses 'window.WebSocket'.
    // ripple-client probably uses 'WebSocket' global. Bun has it.

    await client.connect()
    console.log(`[${name}] Connected successfully!`)

    const channel = client.channel('public-announcements')

    channel.listen('emergency-alert', (data: any) => {
      // Log with special prefix for verify.ts to detect
      console.log(`[${name}] VERIFIED_RECEIPT: ${JSON.stringify(data)}`)
    })

    console.log(`[${name}] Subscribed to public-announcements`)

    // Keep process alive
    setInterval(() => {}, 1000)
  } catch (e) {
    console.error(`[${name}] Connection failed:`, e)
    process.exit(1)
  }
}
