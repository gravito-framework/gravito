---
title: Architecture
order: 3
---

# Architecture

Luminosity's core is powered by an **LSM-Tree (Log-Structured Merge-Tree)** inspired architecture, similar to the storage engines found in high-performance databases like Cassandra, LevelDB, and RocksDB.

This architectural choice enables Luminosity to handle millions of URLs with minimal memory footprint and blazing-fast write performance.

## Core Concepts

<a id="atomic-sequential-writes"></a>

### 1. Atomic Sequential Writes

Traditional sitemap generators often suffer from **random I/O bottlenecks**—every URL update requires reading, modifying, and rewriting a large XML file.

Luminosity takes a fundamentally different approach:

```
[New URL] → [Append to Log] → [Memory Buffer] → [Background Merge]
```

**How it works:**
- New URLs are **appended** to a sequential log file (`sitemap.ops.jsonl`)
- Each write operation is atomic and append-only
- No file locking required during writes
- Zero read-modify-write cycles

**Benefits:**
- Write speeds approaching hardware limits (~70,000 ops/sec)
- No lock contention in high-traffic scenarios
- Crash-safe: incomplete writes don't corrupt existing data

```typescript
// Atomic write example
await engine.getStrategy().add({
  url: 'https://example.com/new-page',
  lastmod: new Date(),
  priority: 0.8
})
// This is append-only, instantly persisted
```

---

<a id="dynamic-compaction"></a>

### 2. Dynamic Compaction

As append-only logs grow, they need periodic consolidation. Luminosity's **Compactor** handles this automatically during idle cycles.

```
[Log 1] + [Log 2] + [Snapshot] → [Merged Snapshot]
```

**How it works:**
- Background thread monitors log size
- When threshold is reached, triggers compaction
- Merges multiple log files into a single snapshot
- Removes duplicate and deleted entries
- Runs without blocking read/write operations

**Configuration:**
```typescript
const engine = new SeoEngine({
  mode: 'incremental',
  baseUrl: 'https://example.com',
  incremental: {
    logDir: './.luminosity',
    compactInterval: 3600000 // Compact every hour
  }
})
```

**Manual Compaction via CLI:**
```bash
bun lux:compact --force
```

---

<a id="zero-copy-serialization"></a>

### 3. Zero-Copy Serialization

When serving sitemaps, Luminosity leverages **streaming XML generation** to avoid loading the entire dataset into memory.

```
[Disk/Memory] → [Stream Transformer] → [XML Output]
```

**How it works:**
- Entries are read as a stream, not loaded entirely into memory
- XML elements are generated on-the-fly using direct buffer writes
- The HTTP response begins before all entries are processed
- Memory usage remains constant regardless of sitemap size

**Memory-efficient serving:**
```typescript
// Handles 1M+ URLs with ~80MB memory
const entries = await engine.getStrategy().getEntries()
const xml = renderer.render(entries, requestUrl)
```

This approach means a site with 1 million URLs uses roughly the same memory as one with 1,000 URLs during sitemap generation.

---

<a id="tiered-storage"></a>

### 4. Tiered Storage

Luminosity automatically manages data across multiple storage tiers for optimal performance:

```
[Hot Data: Memory Cache]
         ↓
[Warm Data: Operations Log]
         ↓
[Cold Data: Snapshot File]
```

**Tier Breakdown:**

| Tier | Storage | Access Speed | Use Case |
|------|---------|--------------|----------|
| L0 (Hot) | In-Memory Cache | ~1μs | Recent updates, active queries |
| L1 (Warm) | JSONL Log File | ~1ms | Pending operations |
| L2 (Cold) | Snapshot JSON | ~10ms | Historical data, backup |

**Automatic Data Movement:**
- New entries start in L0 (memory)
- Periodically flushed to L1 (log file)
- Compaction merges L1 into L2 (snapshot)
- Reads merge all tiers transparently

```typescript
// Example: Cache warming loads cold data into hot tier
await engine.getStrategy().warmCache()
```

---

## Pipeline Visualization

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   INGEST    │───▶│   MEMORY    │───▶│    DISK     │───▶│   OUTPUT    │
│   STREAM    │    │   BUFFER    │    │  SEGMENTS   │    │  (XML/JSON) │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
     │                   │                  │                  │
     ▼                   ▼                  ▼                  ▼
  HTTP POST         MemTable           SSTables          sitemap.xml
  Webhook          (In-Memory)        (Immutable)       robots.txt
  CLI Command       Sorted Map         Snapshots        JSON-LD
```

## Benchmark Results

Using these architectural patterns, Luminosity achieves:

| Metric | Value |
|--------|-------|
| URLs Indexed | 1,000,000 |
| Build Time | 14.2 seconds |
| Memory Peak | 84 MB |
| Throughput | ~70,000 URLs/sec |

See the [Benchmark](/docs/benchmark) page for detailed methodology and results.

## Next Steps

- [Getting Started](/docs/getting-started) - Quick setup guide
- [CLI Commands](/docs/cli) - Terminal control for Luminosity
- [Framework Integration](/docs/frameworks) - Connect with your stack
