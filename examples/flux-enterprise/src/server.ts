import { randomUUID } from 'node:crypto'
import { existsSync } from 'node:fs'
import { readFile } from 'node:fs/promises'
import { env } from './env'
import { traceLocation } from './flux'
import { publishOrder } from './publisher'

const listener = Bun.serve({
  port: env.port,
  async fetch(request) {
    const url = new URL(request.url)

    if (request.method === 'POST' && url.pathname === '/orders') {
      try {
        const payload = await request.json()
        const body = {
          orderId: payload.orderId ?? `order-${randomUUID()}`,
          userId: payload.userId ?? 'guest',
          items: payload.items ?? [{ productId: 'widget-a', qty: 1 }],
        }

        await publishOrder(body)

        return new Response(JSON.stringify({ status: 'queued', orderId: body.orderId }), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        })
      } catch (error) {
        return new Response(JSON.stringify({ error: String(error) }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        })
      }
    }

    if (request.method === 'GET' && url.pathname === '/trace') {
      if (!existsSync(traceLocation)) {
        return new Response('Trace file not found', { status: 404 })
      }
      const trace = await readFile(traceLocation, 'utf-8')
      return new Response(trace, {
        status: 200,
        headers: { 'Content-Type': 'application/x-ndjson' },
      })
    }

    if (request.method === 'GET' && url.pathname === '/trace-events') {
      const events = await readTraceEvents()
      return new Response(JSON.stringify({ events }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    if (request.method === 'POST' && url.pathname === '/retry-workflow') {
      try {
        const { workflowId } = await request.json()
        const events = await readTraceEvents(500)
        const startEvent = events.find(
          (e) => e.workflowId === workflowId && e.type === 'workflow:start'
        ) as any

        if (!startEvent) {
          return new Response(JSON.stringify({ error: 'Original mission data not found' }), {
            status: 404,
          })
        }

        const body = {
          orderId: `retry-${workflowId.slice(0, 8)}-${randomUUID().slice(0, 4)}`,
          userId: startEvent.input?.userId || 'commander',
          items: startEvent.input?.items || [],
        }

        await publishOrder(body)
        return new Response(JSON.stringify({ status: 'retrying', orderId: body.orderId }), {
          status: 200,
        })
      } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500 })
      }
    }

    if (request.method === 'GET' && url.pathname === '/') {
      return dashboardResponse()
    }

    return new Response('Not Found', { status: 404 })
  },
})

function dashboardResponse() {
  return new Response(dashboardHtml, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  })
}

async function readTraceEvents(max = 100) {
  if (!existsSync(traceLocation)) {
    return []
  }

  const trace = await readFile(traceLocation, 'utf-8')
  const lines = trace
    .split(/\r?\n/)
    .filter(Boolean)
    .slice(-max)
    .map((line) => {
      try {
        return JSON.parse(line)
      } catch {
        return null
      }
    })
    .filter((event): event is Record<string, unknown> => Boolean(event))

  return lines
}

const dashboardHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Flux Mission Control</title>
  <style>
    :root {
      --bg: #0b0d14;
      --panel: #161b22;
      --border: #30363d;
      --text: #c9d1d9;
      --accent: #58a6ff;
      --success: #3fb950;
      --warn: #d29922;
      --error: #f85149;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      height: 100vh;
      overflow: hidden;
      display: grid;
      grid-template-columns: 350px 1fr;
    }

    /* Sidebar */
    .mission-control {
      background: var(--panel);
      border-right: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      padding: 1.5rem;
      gap: 1.5rem;
      z-index: 10;
      box-shadow: 4px 0 20px rgba(0,0,0,0.3);
      height: 100vh;
      overflow: hidden;
      box-sizing: border-box;
    }
    h1 { margin: 0; font-size: 1.25rem; letter-spacing: 1px; text-transform: uppercase; color: #fff; }
    h2 { margin: 0; font-size: 0.85rem; text-transform: uppercase; color: #8b949e; margin-bottom: 0.5rem; }

    .control-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    
    button#launch-btn {
      background: var(--accent);
      color: white;
      border: none;
      padding: 1rem;
      font-weight: bold;
      font-size: 1rem;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    button#launch-btn:hover { background: #409eff; transform: translateY(-2px); }
    button#launch-btn:active { transform: translateY(0); }

    #log-feed {
      flex: 1;
      min-height: 0;
      background: #0d1117;
      border: 1px solid var(--border);
      border-radius: 6px;
      padding: 0.75rem;
      overflow-y: auto;
      font-family: monospace;
      font-size: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .log-entry { opacity: 0.7; border-left: 2px solid transparent; padding-left: 6px; }
    .log-entry.new { animation: flash 0.5s; color: #fff; opacity: 1; }
    .log-entry.error { color: var(--error); border-left-color: var(--error); }
    .log-entry.retry { color: var(--warn); border-left-color: var(--warn); }
    .log-entry.success { color: var(--success); border-left-color: var(--success); }

    /* Space View */
    .space-view {
      position: relative;
      background: radial-gradient(circle at bottom center, #1c2333 0%, #0b0d14 70%);
      display: grid;
      grid-template-rows: 1fr 200px;
      grid-template-columns: 1fr 300px;
      overflow: hidden;
    }

    /* Stars */
    .star {
      position: absolute;
      background: white;
      border-radius: 50%;
      opacity: 0.3;
      animation: twinkle 4s infinite;
      z-index: 1;
    }

    /* Pool Layout */
    .pool {
      position: relative;
      border: 1px solid rgba(255,255,255,0.05);
      background: rgba(0,0,0,0.2);
    }

    #active-zone {
      grid-row: 1 / 3;
      grid-column: 1;
      display: flex;
      align-items: flex-end;
      padding-bottom: 2rem;
      overflow-x: auto;
      padding-left: 40px;
      padding-right: 40px;
      z-index: 2;
    }

    #orbit-zone {
      grid-row: 1;
      grid-column: 2;
      border-left: 1px solid var(--border);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
      overflow-y: auto;
      z-index: 3;
      background: rgba(11, 13, 20, 0.8);
      backdrop-filter: blur(4px);
    }

    #failed-zone {
      grid-row: 2;
      grid-column: 2;
      border-left: 1px solid var(--border);
      border-top: 1px solid var(--border);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      overflow-y: auto;
      z-index: 3;
      background: rgba(11, 13, 20, 0.8);
      backdrop-filter: blur(4px);
    }

    .pool-header {
      font-size: 0.7rem;
      color: #8b949e;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 0.5rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    /* Launch Pad Container */
    #launch-pad {
      display: flex;
      gap: 20px;
      align-items: flex-end;
      height: 100%;
      min-width: max-content;
    }

    /* Mini Rocket (in pools) */
    .mini-rocket {
      background: var(--panel);
      padding: 0.75rem;
      border-radius: 4px;
      border: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.7rem;
      transition: all 0.3s ease;
      cursor: pointer;
    }
    .mini-rocket:hover { border-color: var(--accent); background: #1f242c; }
    .mini-rocket .id { font-family: monospace; color: var(--accent); font-weight: bold; }
    .mini-rocket .time { color: var(--success); font-size: 0.65rem; }
    .mini-rocket.failed { border-left: 3px solid var(--error); }
    .mini-rocket.success { border-left: 3px solid var(--success); }

    /* Rocket System (Active) */
    .mission-container {
      position: relative;
      width: 60px;
      height: 100%;
      flex-shrink: 0;
      display: flex;
      flex-direction: column-reverse;
      justify-content: flex-start;
      transition: opacity 0.5s ease;
    }

    .rocket-body {
      position: absolute;
      bottom: 20px;
      left: 0;
      width: 100%;
      display: flex;
      flex-direction: column-reverse;
      transition: transform 0.8s cubic-bezier(0.25, 1, 0.5, 1);
      filter: drop-shadow(0 0 10px rgba(0,0,0,0.5));
    }

    /* FX: Fire & Smoke */
    .engine-fire {
      position: absolute;
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
      width: 30px;
      height: 40px;
      background: linear-gradient(to bottom, #ff4500, #ff8c00, transparent);
      border-radius: 50% 50% 20% 20%;
      filter: blur(4px);
      opacity: 0;
      transition: opacity 0.3s;
      pointer-events: none;
      z-index: -1;
    }
    .rocket-body.active-engine .engine-fire {
      opacity: 1;
      animation: flame-flicker 0.1s infinite;
    }

    .smoke-particle {
      position: absolute;
      background: rgba(200, 200, 200, 0.4);
      border-radius: 50%;
      filter: blur(8px);
      pointer-events: none;
      z-index: 1;
    }

    @keyframes flame-flicker {
      0%, 100% { height: 40px; transform: translateX(-50%) scaleX(1); }
      50% { height: 50px; transform: translateX(-50%) scaleX(1.2); }
    }

    @keyframes smoke-drift {
      0% { transform: scale(1) translateY(0); opacity: 0.4; }
      100% { transform: scale(3) translateY(-100px) translateX(20px); opacity: 0; }
    }

    .screen-shake {
      animation: shake-view 0.1s infinite;
    }
    @keyframes shake-view {
      0%, 100% { transform: translate(0, 0); }
      25% { transform: translate(1px, 1px); }
      50% { transform: translate(-1px, 0px); }
      75% { transform: translate(1px, -1px); }
    }

    /* Stages */
    .stage {
      width: 60px;
      height: 60px;
      background: #2b313a;
      border: 2px solid #484f58;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #8b949e;
      font-size: 0.6rem;
      font-weight: bold;
      text-transform: uppercase;
      transition: all 0.4s ease;
      position: relative;
    }

    .stage[data-step="validate-order"] { 
      border-radius: 0 0 4px 4px; 
      border-bottom: 4px solid #484f58;
    }
    .stage[data-step="notify-customer"] { 
      border-radius: 30px 30px 0 0; 
      height: 70px;
      background: #30363d;
    }

    /* Status States */
    .stage.running {
      background: #1f6feb;
      color: white;
      border-color: #58a6ff;
      box-shadow: 0 0 15px rgba(88, 166, 255, 0.4);
    }
    .stage.retry {
      background: var(--warn);
      color: #1a1a1a;
      border-color: #ffd33d;
      animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both infinite;
    }
    .stage.failed {
      background: var(--error);
      color: white;
      border-color: #ff7b72;
    }
    .stage.completed {
      background: var(--success);
      color: white;
      border-color: #2ea043;
      opacity: 0.6;
      filter: grayscale(0.4);
    }

    .rocket-body.launching-1 { transform: translateY(-70px); }
    .rocket-body.launching-2 { transform: translateY(-140px); }
    .rocket-body.launching-3 { transform: translateY(-210px); }
    .rocket-body.launching-4 { transform: translateY(-350px); }
    .rocket-body.launching-4 .stage[data-step="notify-customer"] {
      box-shadow: 0 0 20px var(--success);
      animation: satellite-pulse 2s infinite;
    }
    @keyframes satellite-pulse {
      0% { box-shadow: 0 0 5px var(--success); }
      50% { box-shadow: 0 0 25px var(--success); }
      100% { box-shadow: 0 0 5px var(--success); }
    }

    .spent-debris {
      position: absolute;
      width: 60px;
      height: 60px;
      background: #21262d;
      border: 1px dashed #484f58;
      opacity: 0.3;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-size: 0.6rem;
      pointer-events: none;
    }

    .mission-id {
      position: absolute;
      bottom: -30px;
      width: 100%;
      text-align: center;
      font-size: 0.7rem;
      color: #8b949e;
      white-space: nowrap;
    }

    .stage-stats {
      display: block;
      font-size: 0.55rem;
      color: #7ee787;
      margin-top: 2px;
      font-family: 'SF Mono', monospace;
      font-weight: normal;
    }
    .total-time {
      position: absolute;
      top: -20px;
      width: 100%;
      text-align: center;
      font-size: 0.65rem;
      color: #fff;
      text-shadow: 0 0 5px var(--accent);
      animation: fadeIn 0.5s;
    }

    /* Details Overlay */
    #details-overlay {
      position: fixed;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.85);
      z-index: 100;
      display: none;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(8px);
    }
    .overlay-content {
      background: var(--panel);
      width: 80%;
      max-width: 800px;
      height: 80%;
      border-radius: 12px;
      border: 1px solid var(--border);
      display: flex;
      flex-direction: column;
      box-shadow: 0 20px 50px rgba(0,0,0,0.5);
    }
    .overlay-header {
      padding: 1.5rem;
      border-bottom: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .overlay-body {
      flex: 1;
      overflow-y: auto;
      padding: 1.5rem;
      font-family: 'SF Mono', monospace;
      font-size: 0.85rem;
    }
    .event-card {
      background: #0d1117;
      border: 1px solid var(--border);
      margin-bottom: 0.5rem;
      padding: 0.75rem;
      border-radius: 4px;
    }
    .event-card .type { font-weight: bold; margin-bottom: 4px; display: block; }
    .event-card.step { border-left: 3px solid var(--accent); }
    .event-card.error { border-left: 3px solid var(--error); background: rgba(248, 81, 73, 0.05); }
    .event-card .data { color: #8b949e; font-size: 0.75rem; white-space: pre-wrap; }

    @keyframes twinkle { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
    @keyframes shake { 
      10%, 90% { transform: translate3d(-1px, 0, 0); } 
      20%, 80% { transform: translate3d(2px, 0, 0); } 
      30%, 50%, 70% { transform: translate3d(-3px, 0, 0); } 
      40%, 60% { transform: translate3d(3px, 0, 0); }
    }
    @keyframes flash { 0% { background: rgba(255,255,255,0.2); } 100% { background: transparent; } }
    @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  </style>
</head>
<body>

  <div class="mission-control">
    <div>
      <h1>Flux Mission Control</h1>
      <p style="color: #8b949e; font-size: 0.8rem; margin-top: 4px;">Antigravity Protocol Enabled</p>
    </div>

    <div class="control-group">
      <div style="display: flex; gap: 8px;">
        <button id="launch-btn" style="flex: 1">🚀 Launch</button>
        <button id="burst-btn" style="flex: 1; background: linear-gradient(135deg, #d29922, #f85149); border: none;">🔥 Burst (x5)</button>
      </div>
      <div style="display: flex; gap: 10px; margin-top: 8px;">
         <label style="font-size: 0.75rem; color: #8b949e; display: flex; align-items: center; cursor: pointer;">
            <input type="checkbox" id="force-fail" style="margin-right: 6px;"> 
            Simulate Stockout
         </label>
      </div>
    </div>

    <div style="flex: 1; display: flex; flex-direction: column;">
      <h2>Telemetry Log</h2>
      <div id="log-feed"></div>
    </div>
  </div>

  <div class="space-view" id="space">
    <div id="active-zone">
      <div id="launch-pad"></div>
    </div>
    
    <div id="orbit-zone" class="pool">
      <div class="pool-header">Orbit (Success)</div>
      <div style="padding: 0 1rem 1rem 1rem">
        <div class="pool-header" style="font-size: 0.6rem; opacity: 0.6; margin-top: 0.5rem;">Stable Orbit (Perfect) <span id="count-perfect">0</span></div>
        <div id="orbit-perfect"></div>
        
        <div class="pool-header" style="font-size: 0.6rem; opacity: 0.6; margin-top: 1rem;">Refitted (Recovered) <span id="count-recovered">0</span></div>
        <div id="orbit-recovered"></div>
      </div>
    </div>

    <div id="failed-zone" class="pool">
      <div class="pool-header">Terminal (Failed) <span id="count-failed">0</span></div>
      <div id="failed-list"></div>
    </div>
  </div>

  <div id="details-overlay">
    <div class="overlay-content">
      <div class="overlay-header">
        <h3 id="overlay-title" style="margin:0">Mission Details</h3>
        <button onclick="closeDetails()" style="background:none; border:none; color:white; cursor:pointer; font-size: 1.5rem;">&times;</button>
      </div>
      <div class="overlay-body" id="overlay-body"></div>
    </div>
  </div>

  <script>
    const steps = ['validate-order', 'reserve-stock', 'charge-payment', 'notify-customer'];
    const activeMissions = new Map(); // workflowId -> State
    const logFeed = document.getElementById('log-feed');
    const launchPad = document.getElementById('launch-pad');
    const missionHistory = new Set();
    const finalStateMissions = new Set();
    let latestTraceEvents = [];

    // Starfield generation
    const space = document.getElementById('space');
    const activeZone = document.getElementById('active-zone');
    for(let i=0; i<50; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.width = Math.random() * 3 + 'px';
      star.style.height = star.style.width;
      star.style.animationDelay = Math.random() * 4 + 's';
      space.appendChild(star);
    }

    function createRocket(id) {
      const container = document.createElement('div');
      container.className = 'mission-container';
      container.id = 'mission-' + id;
      
      const body = document.createElement('div');
      body.className = 'rocket-body';
      
      // Engine fire
      const fire = document.createElement('div');
      fire.className = 'engine-fire';
      body.appendChild(fire);

      steps.forEach((step, idx) => {
        const stage = document.createElement('div');
        stage.className = 'stage';
        stage.dataset.step = step;
        
        let label = step.split('-')[0];
        if(label === 'notify') label = 'SAT-1';
        stage.textContent = label;
        
        body.appendChild(stage);
      });

      const label = document.createElement('div');
      label.className = 'mission-id';
      label.textContent = id.slice(0, 8);
      
      container.appendChild(body);
      container.appendChild(label);
      launchPad.appendChild(container);

      return { container, body, isCleaningUp: false };
    }

    function spawnSmoke(x, y) {
      const p = document.createElement('div');
      p.className = 'smoke-particle';
      const size = 10 + Math.random() * 30;
      p.style.width = size + 'px';
      p.style.height = size + 'px';
      p.style.left = (x - size/2) + 'px';
      p.style.bottom = y + 'px';
      p.style.animation = 'smoke-drift ' + (0.5 + Math.random() * 1) + 's ease-out forwards';
      activeZone.appendChild(p);
      setTimeout(() => p.remove(), 1500);
    }

    function triggerLaunchFX(rocketEl) {
      const rect = rocketEl.getBoundingClientRect();
      const zoneRect = activeZone.getBoundingClientRect();
      const x = rect.left + rect.width / 2 - zoneRect.left;
      
      // Screen shake
      space.classList.add('screen-shake');
      setTimeout(() => space.classList.remove('screen-shake'), 300);

      // Smoke burst
      for(let i=0; i<8; i++) {
        setTimeout(() => spawnSmoke(x + (Math.random() * 40 - 20), 20), i * 30);
      }
    }

    function addLog(text, type) {
      const entry = document.createElement('div');
      entry.className = 'log-entry new ' + (type || '');
      entry.textContent = '[' + new Date().toLocaleTimeString() + '] ' + text;
      logFeed.prepend(entry);
      if(logFeed.children.length > 50) logFeed.lastChild.remove();
    }

    function openDetails(id) {
      const events = latestTraceEvents.filter(e => e.workflowId === id);
      const body = document.getElementById('overlay-body');
      const title = document.getElementById('overlay-title');
      
      title.textContent = 'Mission Log: ' + id;
      body.innerHTML = '';
      
      events.forEach(ev => {
        const card = document.createElement('div');
        card.className = 'event-card ' + (ev.stepName ? 'step' : '') + (ev.type.includes('error') ? ' error' : '');
        
        let content = '<span class="type">' + ev.type.toUpperCase() + (ev.stepName ? ' (' + ev.stepName + ')' : '') + '</span>';
        if (ev.duration) content += '<div>Duration: ' + ev.duration + 'ms</div>';
        if (ev.error) content += '<div style="color:var(--error)">Error: ' + ev.error + '</div>';
        if (ev.input || ev.data) {
          content += '<div class="data">' + JSON.stringify(ev.input || ev.data, null, 2) + '</div>';
        }
        
        card.innerHTML = content;
        body.appendChild(card);
      });
      
      document.getElementById('details-overlay').style.display = 'flex';
    }

    function closeDetails() {
      document.getElementById('details-overlay').style.display = 'none';
    }

    async function retryMission(id) {
      addLog('Mission ' + id.slice(0,8) + ' re-ignition requested...', 'info');
      try {
        const res = await fetch('/retry-workflow', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ workflowId: id })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);

        // Remove the original failed entry from the pool
        const failedList = document.getElementById('failed-list');
        const items = failedList.querySelectorAll('.mini-rocket');
        items.forEach(item => {
           const idSpan = item.querySelector('.id');
           if (idSpan && idSpan.textContent === id.slice(0, 8)) {
             item.remove();
           }
        });
        document.getElementById('count-failed').textContent = failedList.children.length;

        addLog('Mission ' + id.slice(0,8) + ' recovery initiated', 'success');
      } catch (err) {
        addLog('Retry failed: ' + err.message, 'error');
      }
    }

    function addToPool(id, state, poolId) {
      if (finalStateMissions.has(id)) return;
      finalStateMissions.add(id);

      let targetListId = poolId === 'orbit' 
        ? (state.hadRetries ? 'orbit-recovered' : 'orbit-perfect')
        : 'failed-list';
      
      const listEl = document.getElementById(targetListId);
      const poolClass = poolId === 'orbit' 
        ? (state.hadRetries ? 'recovered' : 'success') 
        : 'failed';
      
      const mini = document.createElement('div');
      mini.className = 'mini-rocket ' + poolClass;
      
      let content = '<span class="id">' + id.slice(0, 8) + '</span>';
      if (poolId === 'orbit' && state.duration) {
        content += '<span class="time">' + state.duration + 'ms</span>';
      }
      if (poolId === 'failed') {
        content += '<button class="retry-mini-btn" onclick="retryMission(\\'' + id + '\\'); event.stopPropagation();">⟳</button>';
      }
      
      mini.innerHTML = content;
      mini.onclick = () => openDetails(id);
      
      listEl.prepend(mini);
      
      // Update counts
      if (poolId === 'orbit') {
        document.getElementById('count-perfect').textContent = document.getElementById('orbit-perfect').children.length;
        document.getElementById('count-recovered').textContent = document.getElementById('orbit-recovered').children.length;
      } else {
        document.getElementById('count-failed').textContent = listEl.children.length;
      }

      const elements = activeMissions.get(id);
      if (elements) {
        elements.container.style.opacity = '0';
        setTimeout(() => {
          if(elements.container.parentNode) elements.container.remove();
          activeMissions.delete(id);
        }, 500);
      }
    }

    function updateRocketVisuals(id, state) {
      if (finalStateMissions.has(id)) return;

      let elements = activeMissions.get(id);
      if (!elements) {
        if (missionHistory.has(id)) return;

        elements = createRocket(id);
        elements.prevCount = 0;
        activeMissions.set(id, elements);
        missionHistory.add(id);
        addLog('Mission ' + id.slice(0,8) + ' initialized', 'info');
      }

      const { body, container } = elements;
      let completedCount = 0;
      let hasFailed = false;
      let isBusy = false;

      steps.forEach((stepName, idx) => {
        const stageEl = body.querySelector('.stage[data-step="' + stepName + '"]');
        const stepState = state.steps[stepName];
        
        stageEl.className = 'stage';
        stageEl.dataset.step = stepName;

        if (!stepState) return;

        if (stepState.status === 'completed') {
          stageEl.classList.add('completed');
          completedCount = Math.max(completedCount, idx + 1);
          
          if (!container.querySelector('.spent-debris[data-idx="' + idx + '"]')) {
            const debris = document.createElement('div');
            debris.className = 'spent-debris';
            debris.dataset.idx = idx;
            debris.style.bottom = (20 + (idx * 60)) + 'px';
            debris.textContent = stepName.split('-')[0];
            
            if (stepState.duration !== undefined) {
               const stats = document.createElement('span');
               stats.className = 'stage-stats';
               stats.textContent = stepState.duration + 'ms';
               debris.appendChild(stats);
            }
            container.appendChild(debris);
          }
          
        } else if (stepState.status === 'running') {
           isBusy = true;
           if (stepState.retries > 0) {
             stageEl.classList.add('retry');
             stageEl.textContent = 'RETRY ' + stepState.retries;
           } else {
             stageEl.classList.add('running');
           }
        } else if (stepState.status === 'failed') {
          stageEl.classList.add('failed');
          stageEl.textContent = 'FAIL';
          hasFailed = true;
        }
      });

      // Cinematic Logic: Trigger FX on step completion (Takeoff / Stage Separation)
      if (completedCount > (elements.prevCount || 0)) {
        triggerLaunchFX(elements.body);
        elements.prevCount = completedCount;
      }

      // Engline visual
      if (isBusy) body.classList.add('active-engine');
      else body.classList.remove('active-engine');

      body.className = 'rocket-body launching-' + completedCount + (isBusy ? ' active-engine' : '');
      
      if (state.status === 'completed') {
        addToPool(id, state, 'orbit');
        addLog('Mission ' + id.slice(0,8) + ' successful!', 'success');
      } else if (hasFailed) {
        if (!elements.failedTimeout) {
            elements.failedTimeout = setTimeout(() => {
                addToPool(id, state, 'failed');
            }, 3000);
        }
      }
    }

    const stateCache = {};

    async function fetchTrace() {
      try {
        const res = await fetch('/trace-events');
        const data = await res.json();
        latestTraceEvents = data.events;
        const grouped = {};
        
        data.events.sort((a,b) => (a.timestamp || 0) - (b.timestamp || 0));
        
        data.events.forEach(ev => {
          const id = ev.workflowId;
          if (!grouped[id]) grouped[id] = { status: 'pending', steps: {}, hadRetries: false };
          
          const wf = grouped[id];
          if (ev.type === 'workflow:start') wf.status = 'running';
          if (ev.type === 'workflow:complete') {
             wf.status = 'completed';
             wf.duration = ev.duration;
          }
          
          if (ev.stepName) {
            if (!wf.steps[ev.stepName]) wf.steps[ev.stepName] = { status: 'pending', retries: 0 };
            const step = wf.steps[ev.stepName];
            
            if (ev.type === 'step:start') step.status = 'running';
            if (ev.type === 'step:retry') {
               wf.hadRetries = true;
               step.status = 'running';
               step.retries = ev.retries;
               const key = id + '-' + ev.stepName + '-' + ev.retries;
               if (!stateCache[key]) {
                 addLog(id.slice(0,8) + ': Turbulence in ' + ev.stepName + '! Retrying...', 'retry');
                 stateCache[key] = true;
               }
            }
            if (ev.type === 'step:complete') {
              step.status = 'completed';
              step.duration = ev.duration;
            }
            if (ev.type === 'step:error') {
               step.status = 'failed';
               const key = id + '-' + ev.stepName + '-error';
               if (!stateCache[key]) {
                 addLog(id.slice(0,8) + ': CRITICAL FAILURE - ' + ev.error, 'error');
                 stateCache[key] = true;
               }
            }
          }
        });

        Object.keys(grouped).forEach(id => {
          updateRocketVisuals(id, grouped[id]);
        });

      } catch (e) {
        console.error(e);
      }
    }

    setInterval(fetchTrace, 1000);
    fetchTrace();

    async function performLaunch() {
      const failMode = document.getElementById('force-fail').checked;
      try {
        const res = await fetch('/orders', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({
             userId: 'commander',
             items: failMode 
               ? [{ productId: 'widget-a', qty: 100 }]
               : [{ productId: 'widget-b', qty: 1 }]
           })
        });
        const data = await res.json();
        addLog('Launch sequence initiated: ' + data.orderId);
      } catch (e) {
        addLog('Launch aborted: ' + e.message, 'error');
      }
    }

    document.getElementById('launch-btn').addEventListener('click', async () => {
      const btn = document.getElementById('launch-btn');
      btn.style.transform = 'scale(0.95)';
      setTimeout(() => btn.style.transform = '', 100);
      performLaunch();
    });

    document.getElementById('burst-btn').addEventListener('click', async () => {
      const btn = document.getElementById('burst-btn');
      btn.style.transform = 'scale(0.95)';
      setTimeout(() => btn.style.transform = '', 100);
      
      addLog('MULTIPLE IGNITION DETECTED - BURST MODE ACTIVE', 'warn');
      for(let i=0; i<5; i++) {
        setTimeout(() => performLaunch(), i * 200);
      }
    });
  </script>
</body>
</html>`

console.log(`${env.appName} HTTP server running on port ${env.port}`)
console.log(
  'Navigate to http://localhost:' +
    env.port +
    ' to open the Flux dashboard and POST /orders to enqueue payloads'
)
