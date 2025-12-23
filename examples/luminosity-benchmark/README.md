# 🌌 Luminosity Firepower Benchmark

This project demonstrates the extreme performance of the **Gravito Luminosity** sitemap engine.

## 🎯 Goal
Generate a **1,000,000 URL** sitemap index with minimal memory footprint using Gravito's streaming architecture.

## 🛠️ Stack
- **Runtime**: Bun
- **Database**: SQLite (via `better-sqlite3`) to simulate 1M products.
- **Engine**: `@gravito/constellation` (Sitemap Generator).

## 🚀 How to Run

1. **Install Dependencies**
   ```bash
   bun install
   ```

2. **Seed Database** (Generates 1M dummy records)
   ```bash
   bun run seed
   ```

3. **Run Benchmark**
   ```bash
   bun run benchmark
   ```

## 📊 Expected Results
- **Memory**: < 100MB (Heap Usage)
- **Time**: < 20s (depending on I/O)
- **Output**: `dist-sitemaps/` containing sharded XML files.
