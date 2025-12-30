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
      --panel: #11141d;
      --border: #2d3342;
      --text: #c9d1d9;
      --accent: #58a6ff;
      --success: #3fb950;
      --warn: #d29922;
      --error: #f85149;
    }
    body {
      margin: 0; padding: 0; font-family: 'Segoe UI', monospace;
      background: var(--bg); color: var(--text); height: 100vh;
      overflow: hidden; display: grid; grid-template-columns: 350px 1fr;
    }

    .stats-panel {
      display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 20px;
    }
    .pool {
      background: rgba(255,255,255,0.05); border: 1px solid #333; border-radius: 4px;
      padding: 10px; text-align: center;
    }
    .pool-label { font-size: 0.55rem; color: #888; font-weight: bold; margin-bottom: 4px; }
    .pool-count { font-size: 1.2rem; font-weight: bold; color: #fff; }
    .pool.success .pool-count { color: var(--success); }
    .pool.recovered .pool-count { color: var(--warn); }
    .pool.failed .pool-count { color: var(--error); }

    #attention-list {
      flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 6px;
      padding-right: 4px;
    }
    .attention-item {
      background: rgba(255,255,255,0.03); border: 1px solid #333; border-radius: 4px;
      padding: 8px; font-size: 0.75rem; display: flex; justify-content: space-between; align-items: center;
    }
    .attention-item.recovered { border-left: 3px solid var(--warn); }
    .attention-item.failed { border-left: 3px solid var(--error); background: rgba(248, 81, 73, 0.05); }
    
    .item-info { display: flex; flex-direction: column; gap: 2px; }
    .item-id { font-family: monospace; color: #fff; font-weight: bold; }
    .item-detail { color: #8b949e; font-size: 0.65rem; }
    
    .retry-btn {
      background: var(--accent); color: #0b0d14; border: none; border-radius: 3px;
      padding: 4px 8px; font-size: 0.65rem; font-weight: bold; cursor: pointer;
      text-transform: uppercase;
    }
    .retry-btn:hover { background: #fff; }

    /* Sidebar */
    .mission-control {
      background: var(--panel); border-right: 1px solid var(--border);
      display: flex; flex-direction: column; padding: 1.5rem; gap: 1.5rem;
      height: 100vh; overflow: hidden; box-sizing: border-box;
      z-index: 10;
    }
    h1 { margin: 0; font-size: 1.1rem; letter-spacing: 1px; text-transform: uppercase; color: #fff; border-bottom: 2px solid var(--accent); padding-bottom: 10px; display: inline-block; }
    
    button#launch-btn {
      background: rgba(88, 166, 255, 0.1); color: var(--accent);
      border: 1px solid var(--accent); padding: 1rem;
      font-weight: bold; font-size: 0.9rem; border-radius: 4px;
      cursor: pointer; transition: all 0.2s; text-transform: uppercase; letter-spacing: 1px;
    }
    button#launch-btn:hover:not(:disabled) { background: var(--accent); color: #000; box-shadow: 0 0 15px var(--accent); }
    button#launch-btn:disabled { opacity: 0.5; cursor: not-allowed; border-color: #444; color: #888; }

    #log-feed {
      flex: 1; min-height: 0; background: #0b0d14;
      border: 1px solid var(--border); border-radius: 4px; padding: 0.5rem;
      overflow-y: auto; font-family: 'SF Mono', monospace; font-size: 0.7rem;
      display: flex; flex-direction: column; gap: 6px;
    }
    .log-entry { padding-left: 8px; border-left: 2px solid #333; color: #888; }
    .log-entry.retry { border-color: var(--warn); color: var(--warn); }
    .log-entry.error { border-color: var(--error); color: var(--error); }
    .log-entry.success { border-color: var(--success); color: var(--success); }

    /* Space View */
    .space-view {
      position: relative;
      background: linear-gradient(to bottom, #050608 0%, #13161c 100%);
      display: flex; flex-direction: column; justify-content: flex-end;
      overflow-x: auto; overflow-y: hidden;
    }
    
    /* Grid Background */
    .space-view::before {
      content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 100%;
      background-image: linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 40px 40px; pointer-events: none;
    }

    #launch-pad {
      display: flex; gap: 40px; padding: 0 60px 60px 60px;
      align-items: flex-end; min-width: max-content;
    }

    .mission-container {
      position: relative; width: 60px; height: 300px;
      flex-shrink: 0; display: flex; flex-direction: column-reverse; justify-content: flex-start;
      transition: opacity 1s, transform 1s;
    }
    .mission-container.recycled {
      opacity: 0; transform: scale(0.5); pointer-events: none;
    }

    /* SVG Styling */
    .rocket-svg {
      width: 60px; height: 240px;
      position: absolute; bottom: 0; left: 0;
      transition: transform 1s cubic-bezier(0.25, 1, 0.5, 1);
      will-change: transform;
      filter: drop-shadow(0 0 5px rgba(0,0,0,0.5));
    }

    /* Parts */
    .part {
      fill: #161b22; stroke: #30363d; stroke-width: 1.5px;
      transition: fill 0.3s, stroke 0.3s, opacity 0.5s;
    }
    
    /* Active State (Running) */
    .part.active { fill: #1f6feb; stroke: #58a6ff; }
    /* Warning State */
    .part.retry { fill: #9e6a03; stroke: #d29922; animation: shake 0.5s infinite; }
    /* Error State */
    .part.failed { fill: #7a1e1e; stroke: #ff7b72; }
    /* Completed State (Hollow/Ghost) */
    .part.completed { fill: transparent; stroke: #238636; opacity: 0.3; stroke-dasharray: 4; }
    /* Payload Orbit State */
    .part[data-id="notify"].completed { 
      fill: #238636; stroke: #3fb950; opacity: 1; stroke-dasharray: 0;
      filter: drop-shadow(0 0 8px rgba(63, 185, 80, 0.6));
    }

    /* Text Labels */
    .stage-label { 
      position: absolute; width: 100px; left: -20px; text-align: center;
      font-size: 0.6rem; color: #484f58; font-weight: bold;
      pointer-events: none; opacity: 0; transition: opacity 0.3s;
    }
    .mission-id { bottom: -25px; opacity: 1; color: #8b949e; }
    
    /* Show labels on hover or when detached */
    .debris-label {
      position: absolute; width: 60px; text-align: center;
      font-size: 0.55rem; color: #3fb950;
      opacity: 0; transform: translateY(10px); transition: all 0.5s;
    }
    .debris-label.visible { opacity: 1; transform: translateY(0); }

    /* Launch Animations */
    .rocket-svg.launching-1 { transform: translateY(-60px); }
    .rocket-svg.launching-2 { transform: translateY(-120px); }
    .rocket-svg.launching-3 { transform: translateY(-180px); }
    .rocket-svg.launching-4 { transform: translateY(-380px); } /* Orbit */

    /* Total Time */
    .total-time {
      position: absolute; top: -20px; width: 100%; text-align: center;
      color: #fff; font-size: 0.65rem; text-shadow: 0 0 5px var(--success);
      opacity: 0; transition: opacity 0.5s;
    }
    .rocket-svg.launching-4 .total-time { opacity: 1; }

    @keyframes shake { 
      0%, 100% { transform: translateX(0); }
      25% { transform: translateX(-1px); }
      75% { transform: translateX(1px); }
    }
  </style>
</head>
<body>

  <div class="mission-control">
    <div>
      <h1>Flux Mission Control</h1>
      <div style="font-size: 0.7rem; color: #666; margin-top: 5px;">SYS: ONLINE // MODE: SVG_NEO</div>
    </div>

    <div class="control-group">
      <button id="launch-btn">🚀 INITIALIZE LAUNCH</button>
      <label style="font-size: 0.75rem; color: #8b949e; display: flex; align-items: center; cursor: pointer; margin-top: 10px;">
        <input type="checkbox" id="force-fail" style="margin-right: 8px;"> 
        SIMULATE ANOMALY (Stockout)
      </label>
    </div>
    
    <div class="stats-panel">
      <div class="pool success"><div class="pool-label">PERFECT</div><div class="pool-count" id="count-perfect">0</div></div>
      <div class="pool recovered"><div class="pool-label">RECOVERED</div><div class="pool-count" id="count-recovered">0</div></div>
      <div class="pool failed"><div class="pool-label">FAILED</div><div class="pool-count" id="count-failed">0</div></div>
    </div>

    <div style="flex: 1; display: flex; flex-direction: column; overflow: hidden; margin-top: 1rem;">
      <h2 style="font-size: 0.75rem; color: #d29922; text-transform: uppercase; margin-bottom: 0.5rem;">Attention Required</h2>
      <div id="attention-list"></div>
    </div>

    <div style="height: 25%; display: flex; flex-direction: column; border-top: 1px solid var(--border); padding-top: 1rem;">
      <h2 style="font-size: 0.75rem; color: #58a6ff; text-transform: uppercase; margin-bottom: 0.5rem;">System Logs</h2>
      <div id="log-feed"></div>
    </div>
  </div>

  <div class="space-view">
    <div id="launch-pad"></div>
  </div>

  <script>
    const steps = ['validate-order', 'reserve-stock', 'charge-payment', 'notify-customer'];
    const stepMap = {
      'validate-order': 'booster',
      'reserve-stock': 'fuel',
      'charge-payment': 'upper',
      'notify-customer': 'notify'
    };

    const activeMissions = new Map();
    const missionHistory = new Set();
    const finalStateMissions = new Set();
    const stateCache = {};
    const pageLoadTime = Date.now();
    
    const logFeed = document.getElementById('log-feed');
    const launchPad = document.getElementById('launch-pad');

    // Store payloads for retry
    const missionPayloads = new Map();

    function createRocketSVG(id) {
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("class", "rocket-svg");
      svg.setAttribute("viewBox", "0 0 60 240");
      
      const gNotify = document.createElementNS(svgNS, "g"); gNotify.setAttribute("id", "p-" + id + "-notify"); gNotify.setAttribute("class", "part");
      const pNotify = document.createElementNS(svgNS, "path"); pNotify.setAttribute("d", "M15,60 L15,40 C15,20 30,10 30,10 C30,10 45,20 45,40 L45,60 Z"); gNotify.appendChild(pNotify);
      
      const timeText = document.createElement("div"); timeText.className = "total-time";
      
      const gUpper = document.createElementNS(svgNS, "g"); gUpper.setAttribute("id", "p-" + id + "-upper"); gUpper.setAttribute("class", "part");
      const pUpper = document.createElementNS(svgNS, "rect"); pUpper.setAttribute("x", "15"); pUpper.setAttribute("y", "62"); pUpper.setAttribute("width", "30"); pUpper.setAttribute("height", "58"); gUpper.appendChild(pUpper);

      const gFuel = document.createElementNS(svgNS, "g"); gFuel.setAttribute("id", "p-" + id + "-fuel"); gFuel.setAttribute("class", "part");
      const pFuel = document.createElementNS(svgNS, "rect"); pFuel.setAttribute("x", "15"); pFuel.setAttribute("y", "122"); pFuel.setAttribute("width", "30"); pFuel.setAttribute("height", "58"); gFuel.appendChild(pFuel);

      const gBooster = document.createElementNS(svgNS, "g"); gBooster.setAttribute("id", "p-" + id + "-booster"); gBooster.setAttribute("class", "part");
      const pBooster = document.createElementNS(svgNS, "path"); pBooster.setAttribute("d", "M15,182 L15,230 L5,240 L15,240 L20,235 L40,235 L45,240 L55,240 L45,230 L45,182 Z"); gBooster.appendChild(pBooster);

      svg.appendChild(gBooster); svg.appendChild(gFuel); svg.appendChild(gUpper); svg.appendChild(gNotify);
      return { svg, timeText };
    }

    function createMissionDOM(id) {
      const container = document.createElement('div');
      container.className = 'mission-container';
      container.id = 'mission-' + id;

      const { svg, timeText } = createRocketSVG(id);
      
      const debrisLabels = {};
      steps.forEach((step, idx) => {
         const label = document.createElement('div');
         label.className = 'debris-label';
         label.style.bottom = (240 - ((idx + 1) * 60) + 20) + 'px';
         label.dataset.step = step;
         container.appendChild(label);
         debrisLabels[step] = label;
      });

      const labelId = document.createElement('div');
      labelId.className = 'stage-label mission-id';
      labelId.textContent = id.slice(0, 8);

      container.appendChild(svg);
      container.appendChild(timeText);
      container.appendChild(labelId);
      launchPad.appendChild(container);

      // Cleanup DOM later
      setTimeout(() => { if(container.parentNode) container.remove(); }, 120000);

      return { container, svg, debrisLabels, isCleaningUp: false, hadRetries: false };
    }

    function retryMission(id) {
       let payload = missionPayloads.get(id);
       
       if (!payload) {
         // Fallback: Create a new payload based on current settings
         // We assume the user wants to retry with the same "intent"
         const failMode = document.getElementById('force-fail').checked;
         payload = {
             userId: 'commander-retry',
             items: failMode ? [{ productId: 'widget-a', qty: 100 }] : [{ productId: 'widget-b', qty: 1 }]
         };
         addLog('Re-igniting ' + id.slice(0,8) + ' (Fallback payload)...', 'retry');
       } else {
         addLog('Re-igniting ' + id.slice(0,8) + '...', 'retry');
       }

       performLaunch(payload);
       
       const item = document.getElementById('attn-' + id);
       if (item) {
         item.style.opacity = '0.5';
         item.style.pointerEvents = 'none';
         item.querySelector('.retry-btn').textContent = 'Sent';
       }
    }

    function addLog(text, type) {
      const entry = document.createElement('div');
      entry.className = 'log-entry ' + (type || '');
      entry.textContent = '[' + new Date().toLocaleTimeString() + '] ' + text;
      logFeed.prepend(entry);
      if(logFeed.children.length > 100) logFeed.lastChild.remove();
    }

    function addToPool(id, state) {
      if (finalStateMissions.has(id)) return;
      finalStateMissions.add(id);

      let type = 'failed';
      let reason = '';

      if (state.status === 'completed') {
         if (state.hadRetries) {
            type = 'recovered';
            // Find the step that was retried
            const badStep = Object.keys(state.steps).find(k => state.steps[k].retries > 0);
            reason = badStep ? 'Retried: ' + badStep.split('-')[0].toUpperCase() : 'Retried';
         } else {
            type = 'success';
         }
      } else {
         // Find the failed step
         const failedStep = Object.keys(state.steps).find(k => state.steps[k].status === 'failed');
         reason = failedStep ? 'Failed at: ' + failedStep.split('-')[0].toUpperCase() : 'Unknown Error';
      }

      // Update Count
      const el = document.getElementById(type === 'success' ? 'count-perfect' : (type === 'recovered' ? 'count-recovered' : 'count-failed'));
      if (el) el.textContent = parseInt(el.textContent) + 1;

      // Add to Attention List if not perfect
      if (type !== 'success') {
        const list = document.getElementById('attention-list');
        const item = document.createElement('div');
        item.className = 'attention-item ' + type;
        item.id = 'attn-' + id;
        
        let html = '<div class="item-info"><span class="item-id">' + id.slice(0, 8) + '</span>';
        html += '<span class="item-detail">' + reason + '</span></div>';
        
        if (type === 'failed') {
           html += '<button class="retry-btn" onclick="retryMission(\\'' + id + '\\')">Retry</button>';
        }
        
        item.innerHTML = html;
        list.prepend(item);
      }
    }

    function updateRocketVisuals(id, state) {
      let elements = activeMissions.get(id);
      if (!elements) {
        if (missionHistory.has(id)) return;
        elements = createMissionDOM(id);
        activeMissions.set(id, elements);
        missionHistory.add(id);
      }

      const { svg, debrisLabels, container } = elements;
      let completedCount = 0;

      steps.forEach((stepName, idx) => {
        const svgGroupId = 'p-' + id + '-' + stepMap[stepName];
        const part = svg.getElementById(svgGroupId);
        const stepState = state.steps[stepName];
        if (!stepState || !part) return;

        part.setAttribute("class", "part");

        if (stepState.status === 'completed') {
          part.classList.add('completed');
          completedCount = Math.max(completedCount, idx + 1);
          if (stepState.duration && debrisLabels[stepName]) {
             debrisLabels[stepName].textContent = stepState.duration + 'ms';
             debrisLabels[stepName].classList.add('visible');
          }
        } else if (stepState.status === 'running') {
           part.classList.add('active');
           if (stepState.retries > 0) {
             elements.hadRetries = true;
             part.classList.add('retry');
           } 
        } else if (stepState.status === 'failed') {
          part.classList.add('failed');
        }
      });

      svg.className.baseVal = 'rocket-svg launching-' + completedCount;

      // Check for completion or failure
      function scheduleRecycle(missionId, missionElements) {
        if (missionElements.isCleaningUp) return;
        missionElements.isCleaningUp = true;
        
        setTimeout(() => {
          missionElements.container.classList.add('recycled');
          setTimeout(() => {
            if (missionElements.container.parentNode) missionElements.container.remove();
            activeMissions.delete(missionId);
          }, 1000);
        }, 10000); // Wait 10s before recycling
      }

      if (state.status === 'completed' && !elements.isCleaningUp) {
        if (state.duration) {
           const timeEl = container.querySelector('.total-time');
           if(timeEl) timeEl.textContent = '⏱ ' + state.duration + 'ms';
        }
        state.hadRetries = elements.hadRetries;
        addToPool(id, state);
        scheduleRecycle(id, elements);
      } else if (state.status === 'failed' && !elements.isCleaningUp) {
        addToPool(id, state);
        scheduleRecycle(id, elements);
      }
    }

    async function fetchTrace() {
      try {
        const res = await fetch('/trace-events');
        const data = await res.json();
        const grouped = {};
        data.events.sort((a,b) => (a.timestamp || 0) - (b.timestamp || 0));
        
        data.events.forEach(ev => {
          const id = ev.workflowId;
          if (!grouped[id]) grouped[id] = { status: 'pending', steps: {} };
          const wf = grouped[id];
          if (ev.type === 'workflow:start') wf.status = 'running';
          if (ev.type === 'workflow:complete') { wf.status = 'completed'; wf.duration = ev.duration; }
          
          if (ev.stepName) {
            if (!wf.steps[ev.stepName]) wf.steps[ev.stepName] = { status: 'pending', retries: 0 };
            const step = wf.steps[ev.stepName];
            if (ev.type === 'step:start') step.status = 'running';
            if (ev.type === 'step:retry') {
               step.status = 'running';
               step.retries = ev.retries;
               const key = id + '-' + ev.stepName + '-' + ev.retries;
               if (!stateCache[key]) {
                 if (ev.timestamp > pageLoadTime) addLog(id.slice(0,8) + ': Retry ' + ev.stepName, 'retry');
                 stateCache[key] = true;
               }
            }
            if (ev.type === 'step:complete') { step.status = 'completed'; step.duration = ev.duration; }
            if (ev.type === 'step:error') {
               step.status = 'failed';
               wf.status = 'failed'; // Fix: Mark workflow as failed
               const key = id + '-' + ev.stepName + '-error';
               if (!stateCache[key]) {
                 if (ev.timestamp > pageLoadTime) addLog(id.slice(0,8) + ': Failed ' + ev.stepName, 'error');
                 stateCache[key] = true;
               }
            }
          }
        });

        Object.keys(grouped).forEach(id => updateRocketVisuals(id, grouped[id]));
      } catch (e) { console.error(e); }
    }

    setInterval(fetchTrace, 1000);
    fetchTrace();

    async function performLaunch(customPayload) {
      const failMode = document.getElementById('force-fail').checked;
      const payload = customPayload || {
         userId: 'commander',
         items: failMode ? [{ productId: 'widget-a', qty: 100 }] : [{ productId: 'widget-b', qty: 1 }]
      };

      try {
        const res = await fetch('/orders', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify(payload)
        });
        const data = await res.json();
        // Store payload for retry
        if (data.orderId) missionPayloads.set(data.orderId, payload); // Wait, orderId changes on server? 
        // The server generates orderId if not provided. 
        // We should really generate it client side to track it properly or map it back.
        // For now, we store it by the ID returned.
        
        // Actually, the server returns the ID. We can map it.
        missionPayloads.set(data.orderId, payload);
        
        addLog('Mission Launched: ' + data.orderId, 'success');
      } catch (e) {
        addLog('Launch aborted: ' + e.message, 'error');
      }
    }

    document.getElementById('launch-btn').addEventListener('click', async () => {
      const btn = document.getElementById('launch-btn');
      btn.disabled = true;
      btn.textContent = 'Ignition...';
      try {
        await performLaunch();
      } finally {
        setTimeout(() => { btn.disabled = false; btn.textContent = '🚀 INITIALIZE LAUNCH'; }, 500);
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
