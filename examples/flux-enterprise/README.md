# Flux Enterprise Demo

This example proves out the RabbitMQ → Flux workflow outlined in the DX plan. It shows how a queue-based producer, Gravito consumer, and `JsonFileTraceSink` collaborate to deliver retries, traceability, and observability for an order fulfillment flow.

## Features
- **RabbitMQ-backed consumer**: `examples/flux-enterprise/src/consumer.ts` listens on `orders.workflow`, executes `orderWorkflow`, and writes trace events in `.flux-enterprise/trace.ndjson`.
- **HTTP producer**: `examples/flux-enterprise/src/server.ts` exposes `POST /orders`, `GET /trace`, and proxies payloads into the queue so you can verify the workflow end-to-end.
- **Flux workflow**: `src/workflows/order.ts` models validation, reservation, payment, and notification steps, complete with retries and a simulated reservation conflict on the first attempt.
- **Verification script**: `flux-enterprise.ts` runs install/build/migrate/doctor/test to ensure the entire stack (including `gravito doctor`) is healthy.

## Quick start
1. Copy the environment template: `cp examples/flux-enterprise/.env.example examples/flux-enterprise/.env`.
2. Start RabbitMQ: `docker compose -f docker-compose.flux.yml up -d rabbitmq`.
3. Start the Flux consumer: `cd examples/flux-enterprise && bun run src/consumer.ts`.
4. Start the HTTP producer (in another shell): `cd examples/flux-enterprise && bun run src/server.ts`.
5. Submit a payload: `curl -X POST http://localhost:4002/orders -H "Content-Type: application/json" -d '{"userId":"u1","items":[{"productId":"widget-a","qty":1}]}'`.
6. Inspect traces: `curl http://localhost:4002/trace | tail`.
7. Visit the dashboard at `http://localhost:4002/` to publish orders via the UI and watch queue/workflow updates in real time; the list shows newest events at the top, highlights fresh entries, polls `/trace-events`, and the canvas timeline animates a particle for each stage so you can feel retries/failures moving toward completion.

## Automation & verification
- `bun run examples/flux-enterprise/scripts/publish-order.ts`: push a ready-made order into RabbitMQ.
- `bun run examples/flux-enterprise/flux-enterprise.ts`: mimics the DX workflow (install, build CLI, run migrations, doctor, tests).
- `bun test` from the example root executes `tests/order.test.ts`, which confirms `orderWorkflow` handles retries and validation errors.

## Observability
- `JsonFileTraceSink` writes step events to the trace path defined in `.env` (`.flux-enterprise/trace.ndjson`). Each event includes status, duration, and error information for rapid diagnosis.
- `POST /orders` triggers `orderWorkflow` via RabbitMQ, while `GET /trace` serves the NDJSON trace stream so you can follow each step and retry count.

## Cleanup
- Tear down RabbitMQ with `docker compose -f docker-compose.flux.yml down`.
- Remove the local SQLite file `flux-enterprise.db` and trace file when you want a clean slate.
