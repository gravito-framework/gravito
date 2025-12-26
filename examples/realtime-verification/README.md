# Real-time Verification

This example validates the Gravito Real-time Suite (`ripple`, `radiance`, `echo`) in a multi-node environment.

## Scenario
**Multi-node Emergency Broadcast System**
- Two independent Server Nodes (Server A, Server B)
- File-based "Redis" simulation for inter-node communication
- Clients connecting to different nodes
- Broadcasting a message on one node should reach clients on ALL nodes.

## Running
```bash
bun run verify.ts
```

## Architecture
- **Server**: Uses `OrbitRipple` for WebSockets and `OrbitRadiance` for broadcasting.
- **Broadcaster**: Custom `FileSystemDriver` for Radiance that writes to `storage/broadcast_log.jsonl`.
- **Syncer**: `src/server.ts` watches the log file and re-broadcasts messages to local WebSocket clients.
