# 🎮 Flux Console - Live Demo Walkthrough

This guide provides a step-by-step script for demonstrating the capabilities of **Flux Console**. It simulates a real-world production environment with traffic spikes, worker processing, and real-time monitoring.

## 🏗️ Architecture Setup

In this demo, we will run three components locally:
1.  **Redis**: The message broker (must be running on `localhost:6379`).
2.  **Flux Console**: The monitoring dashboard.
3.  **Demo Worker**: A simulated worker that processes jobs from queues (`orders`, `reports`, etc.).
4.  **Traffic Generator**: A script to flood the queues with jobs.

---

## 🎬 Step-by-Step Demo Script

### Step 1: Start the Flux Console 🖥️

Open your first terminal window and launch the console. This starts both the web server and the SSE (Server-Sent Events) stream.

```bash
cd packages/flux-console
bun run start
```

> **Verify**: Open [http://localhost:3000](http://localhost:3000) in your browser. You should see the dashboard. It might be empty or show "No Data" initially.

### Step 2: Start the Worker 👷

We need a worker to "eat" the jobs. Without this, jobs will just pile up in the queue.
Open a **second terminal window**:

```bash
cd packages/flux-console
bun run scripts/demo-worker.ts
```

> **Observe**: 
> - You should see `[Consumer] Started`.
> - The console output will show it's watching queues: `orders`, `notifications`, `billing`, etc.
> - **In the Browser**: Go to the **Workers** page. You should see `worker-xxxxx` appear as "Online". Note the **Cluster RAM** and **Load** metrics which reflect your actual machine's status.

### Step 3: Unleash the Traffic! 🚀

Now, let's simulate a traffic spike (e.g., Black Friday sale).
Open a **third terminal window**:

```bash
cd packages/flux-console
bun run scripts/generate-random-traffic.ts
```

This script will:
- Push **50 jobs** randomly distribute to different queues.
- Some jobs are designed to **fail** (to test error handling).
- Some jobs are **delayed**.

> **Pro Tip**: Run this command multiple times rapidly to simulate a higher load spike!

### Step 4: The Showcase (What to show in the UI) ✨

Now, switch to the browser window and walk through these views:

#### 1. 📊 Dashboard (Overview)
- **Throughput Chart**: You will see a sudden spike in the green line (Processed/min).
- **Active Queues**: You'll see numbers jumping in `Waiting` and `Active` columns.
- **Top Right Live Logs**: Watch the logs stream in real-time as the worker processes jobs.

#### 2. 🧱 Queues Page
- Navigate to the **Queues** tab.
- Click on `queue:orders` or `queue:email`.
- **Action**: You can see jobs moving from **Waiting** to **Active**.
- **Inspection**: Click the "Eye" icon (Inspector) on a queue to see the JSON payload of waiting jobs.

#### 3. 🚨 Retry Handling (The "Oh No!" Moment)
- Go to the **Queues** page and look for the **Failed** tab (Red badge).
- You should see jobs with an error like `Simulated permanent failure`.
- **Action**: Click the "Retry All" button specifically for the failed jobs.
- **Result**: Watch the "Failed" count drop to 0 and the "Waiting" count go up. The worker will pick them up again.

#### 4. ⚙️ Workers Page
- Refresh or stay on the **Workers** page.
- Observe the **Avg Load** bar changing colors (Green -> Amber) depending on your CPU usage.
- Explain that this demonstrates the **Real-time Health Monitoring** of the infrastructure.

---

## 🧹 Cleanup

To reset the demo environment (purge all queues):

```bash
# In the third terminal
bun run scripts/debug-redis.ts
# OR manually flush redis if you have redis-cli installed
# redis-cli flushall
```
