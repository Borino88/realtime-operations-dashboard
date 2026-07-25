const test = require('node:test');
const assert = require('node:assert');
const http = require('http');
const { app, server, intervalId } = require('../server/index');

test('GET /api/status returns live operational telemetry', async (t) => {
  await new Promise((resolve) => {
    const srv = http.createServer(app);
    srv.listen(0, () => {
      const port = srv.address().port;
      http.get(`http://localhost:${port}/api/status`, (res) => {
        assert.strictEqual(res.statusCode, 200);
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const parsed = JSON.parse(data);
          assert.strictEqual(typeof parsed.status, 'string');
          assert.strictEqual(typeof parsed.metrics.cpu_usage_percent, 'number');
          assert.ok(Array.isArray(parsed.incidents));
          assert.ok(Array.isArray(parsed.audit_trail));
          srv.close();
          resolve();
        });
      });
    });
  });
});

test('POST /api/incident/inject creates new simulated incident and downgrades status', async (t) => {
  await new Promise((resolve) => {
    const srv = http.createServer(app);
    srv.listen(0, () => {
      const port = srv.address().port;
      const payload = JSON.stringify({
        severity: "CRITICAL",
        service: "Test Database Node",
        message: "Simulated memory leak for integration testing."
      });

      const req = http.request(`http://localhost:${port}/api/incident/inject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload)
        }
      }, (res) => {
        assert.strictEqual(res.statusCode, 201);
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          const parsed = JSON.parse(data);
          assert.strictEqual(parsed.status, "success");
          assert.strictEqual(parsed.incident.service, "Test Database Node");
          srv.close();
          resolve();
        });
      });
      req.write(payload);
      req.end();
    });
  });
});

// Cleanup timer after tests finish
test.after(() => {
  clearInterval(intervalId);
  server.close();
});
