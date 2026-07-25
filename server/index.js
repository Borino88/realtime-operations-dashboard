const http = require('http');
const express = require('express');
const { WebSocketServer } = require('ws');
const path = require('path');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// In-memory operational state store
let systemStatus = "HEALTHY";
let activeIncidents = [
  { id: "INC-101", timestamp: new Date(Date.now() - 3600000).toISOString(), severity: "WARNING", service: "Payment Gateway API", message: "Intermittent webhook settlement delays observed (p95 > 450ms)." }
];
let auditTrail = [
  { id: "AUD-01", timestamp: new Date(Date.now() - 7200000).toISOString(), actor: "ADMIN_FATTAHI", action: "DEPLOYMENT_ROLLOUT", target: "auth-service-v2" }
];

// Generate synthetic real-time metrics
function getLiveMetrics() {
  const cpu = Math.floor(35 + Math.random() * 25 + (systemStatus === "DEGRADED" ? 25 : 0));
  const memory = Math.floor(60 + Math.random() * 15);
  const latency = Math.floor(45 + Math.random() * 30 + (systemStatus === "DEGRADED" ? 180 : 0));
  const tps = Math.floor(1200 + Math.random() * 400);
  
  return {
    timestamp: new Date().toISOString(),
    status: systemStatus,
    metrics: { cpu_usage_percent: cpu, memory_usage_percent: memory, p95_latency_ms: latency, active_tps: tps },
    incidents: activeIncidents,
    audit_trail: auditTrail
  };
}

// REST endpoints for role-based control and simulation
app.get('/api/status', (req, res) => {
  res.json(getLiveMetrics());
});

app.post('/api/incident/inject', (req, res) => {
  const { severity, service, message } = req.body;
  if (!service || !message) {
    return res.status(400).json({ error: "Service and message required." });
  }
  const newInc = {
    id: `INC-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: new Date().toISOString(),
    severity: severity || "CRITICAL",
    service,
    message
  };
  activeIncidents.unshift(newInc);
  if (severity === "CRITICAL") systemStatus = "DEGRADED";
  
  broadcastTelemetry();
  res.status(201).json({ status: "success", incident: newInc });
});

app.post('/api/incident/resolve', (req, res) => {
  const { id, actor } = req.body;
  activeIncidents = activeIncidents.filter(i => i.id !== id);
  if (activeIncidents.length === 0) systemStatus = "HEALTHY";
  
  auditTrail.unshift({
    id: `AUD-${Math.floor(10 + Math.random() * 90)}`,
    timestamp: new Date().toISOString(),
    actor: actor || "OPERATOR_AUTO",
    action: "INCIDENT_RESOLVED",
    target: id
  });
  
  broadcastTelemetry();
  res.json({ status: "success", active_incidents: activeIncidents.length });
});

// WebSocket connection handling
function broadcastTelemetry() {
  const payload = JSON.stringify({ type: "TELEMETRY_UPDATE", data: getLiveMetrics() });
  wss.clients.forEach(client => {
    if (client.readyState === 1) { // OPEN
      client.send(payload);
    }
  });
}

// Start simulation broadcast every 2000 ms
const intervalId = setInterval(() => {
  broadcastTelemetry();
}, 2000);

wss.on('connection', (ws) => {
  ws.send(JSON.stringify({ type: "CONNECTION_ACK", message: "Connected to Real-Time Operations Telemetry Stream", data: getLiveMetrics() }));
});

const PORT = process.env.PORT || 8000;
if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`🚀 Real-Time Operations Dashboard running on http://localhost:${PORT}`);
  });
}

module.exports = { app, server, wss, intervalId };
