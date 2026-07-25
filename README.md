# Real-Time Operations Monitoring Dashboard (`realtime-operations-dashboard`)

[![CI & Docker Publish](https://github.com/Borino88/realtime-operations-dashboard/actions/workflows/docker-publish.yml/badge.svg)](https://github.com/Borino88/realtime-operations-dashboard/actions/workflows/docker-publish.yml)
[![Docker Pulls](https://img.shields.io/badge/Docker%20Hub-borino88%2Frealtime--operations--dashboard-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://app.docker.com/repository/docker/borino88/realtime-operations-dashboard)
[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![WebSockets](https://img.shields.io/badge/WebSockets-Live_Stream-010101?style=for-the-badge&logo=socket.io&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API)

A high-performance, real-time operational telemetry and incident monitoring dashboard engineered by **Mahdi Fattahi** showcasing low-latency WebSocket streaming, role-based operational views, and immutable audit logging.

---

## 🐳 Docker Container Quick-Start

The dashboard is packaged as a hardened, multi-stage Node.js container executing strictly under an unprivileged non-root user (`appuser`, UID `1000`) and compiled for multi-architecture deployments (`linux/amd64`, `linux/arm64`).

### 1. Docker Pull Command
```bash
docker pull borino88/realtime-operations-dashboard:latest
```

### 2. Supported Tags & Architectures
* **Tags:** `1.0.0`, `1.0`, `1`, `latest`, `main`
* **Architectures:** `linux/amd64`, `linux/arm64`
* **Docker Hub Repository:** [borino88/realtime-operations-dashboard](https://app.docker.com/repository/docker/borino88/realtime-operations-dashboard)

### 3. Docker Compose Instructions
Launch the operations dashboard in an isolated container stack:
```yaml
version: '3.8'
services:
  dashboard:
    image: borino88/realtime-operations-dashboard:latest
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - NODE_ENV=production
    user: "1000:1000"
    healthcheck:
      test: ["CMD", "node", "-e", "fetch('http://localhost:3000/api/status').then(r => r.ok ? process.exit(0) : process.exit(1)).catch(() => process.exit(1))"]
      interval: 30s
      timeout: 5s
      retries: 3
```

---

## ⚡ Real-Time Performance & Low-Latency Streaming
Traditional HTTP polling degrades network throughput and increases server CPU load under high operator concurrency. This system implements a bidirectional **WebSocket (`ws`) event pipeline**:
* **Live Telemetry Broadcast:** The backend pushes system health snapshots (CPU load, memory consumption, P95 API latency, and active TPS) every 2,000 ms to all connected clients.
* **Instant Incident Propagation:** When a microservice fault is detected or injected (`POST /api/incident/inject`), all connected operator dashboards receive instantaneous state transitions without page reloads.

---

## 🔒 Role-Based Operational Views (RBAC)
To prevent accidental misconfiguration during critical system outages, the UI enforces strict role-based control tiers:
1. **`ADMIN` Role:** Full operational authority. Can inject synthetic failure incidents for chaos engineering tests and execute emergency incident resolutions.
2. **`OPERATOR` Role:** Standard monitoring tier. Authorized to acknowledge and resolve active system incidents, triggering immutable entries in the audit trail.
3. **`AUDITOR` Role:** Strictly read-only compliance view. Incident resolution buttons are hidden and disabled both client-side and server-side.

---

## 🏗️ Architecture & Event Pipeline

```text
+-------------------------------------------------------------------------------+
|                      NODE.JS WEBSOCKET & HTTP TELEMETRY ENGINE                |
|   - Generates synthetic infrastructure metrics (CPU, Mem, Latency, TPS)       |
|   - Manages Active Incident Queue & Immutable Audit Trail Store              |
+-------------------------------------------------------------------------------+
                                        |
                   WebSocket Broadcast (wss:// / ws://)
                                        v
+-------------------------------------------------------------------------------+
|                      REACT 18 SINGLE-PAGE OPERATOR DASHBOARD                  |
|   - Live 60 FPS Telemetry Gauge Rendering & Pulse Status Indicators           |
|   - Dynamic Role Switching (ADMIN / OPERATOR / AUDITOR)                      |
|   - Dark / Light Mode Tailwind Theme Engine                                   |
+-------------------------------------------------------------------------------+
```

---

## 🚀 Quick Start (Local Startup)

### 1. Launch via Docker Compose (Recommended)
```bash
git clone https://github.com/Borino88/realtime-operations-dashboard.git
cd realtime-operations-dashboard

docker-compose up --build
```
* **Live Operator UI:** Open `http://localhost:8000` in your web browser.

### 2. Run with Node.js
```bash
npm ci
npm start
```

---

## 🧪 Automated Testing
Run the Node.js built-in test runner suite verifying REST endpoints, telemetry structure, and incident injection simulation:
```bash
npm test
```

---

## 📬 Contact & Coordinates
* **Architect:** [Mahdi Fattahi](https://fattahi.xyz)
* **Email:** [a.borino88@gmail.com](mailto:a.borino88@gmail.com)
* **LinkedIn:** [Mahdi Fattahi](https://www.linkedin.com/in/mahdi-fattahi-685964120/)
* **GitHub Profile:** [Borino88](https://github.com/Borino88)

---
*© 2026 Mahdi Fattahi. Released under the MIT License for architectural demonstration purposes.*
