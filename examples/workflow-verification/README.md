# Workflow & Validation Verification

This example validates the Gravito Business Suite (`flux`, `impulse`, `mass`) in a complex order processing scenario.

## Scenario
**Order Fulfillment Workflow**
- **Validation**: Uses `impulse` (Laravel-style FormRequest) to validate incoming order data (Zod-based).
- **Workflow (Flux)**:
    - `check-stock`: Verifies product availability.
    - `process-payment`: Simulates payment gateway charging.
    - `fulfill` (Commit Step): Finalizes order and generates tracking number.

## Running
```bash
bun run verify.ts
```

## Highlights
- **Layered Logic**: Demonstrates separating HTTP request validation (`impulse`) from core business logic execution (`flux`).
- **Resilience**: Shows `flux` step retry and error handling capabilities.
- **Type Safety**: Full end-to-end type safety from request schema to workflow context data.
