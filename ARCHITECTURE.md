# Real-Time Operations Monitoring Dashboard — Architectural & UX Design Document

## 1. Executive Summary
This document outlines the engineering design, state management strategies, and operational UX decisions behind the Real-Time Operations Monitoring Dashboard. Engineered for mission-critical infrastructure observability, the system achieves sub-50ms visual state updates without UI jank or memory leaks.

---

## 2. Real-Time Telemetry & State Management

### 2.1 WebSocket Transport Layer
To eliminate polling overhead, the client establishes an asynchronous WebSocket connection (`ws://` or `wss://`) upon initialization.
* **Heartbeat & Reconnection:** The client listens for `TELEMETRY_UPDATE` packets broadcasted at a 2Hz interval (every 2,000 ms).
* **State Immutability:** Received telemetry JSON payloads cleanly overwrite the React component state, triggering optimized re-renders only for DOM nodes whose underlying numerical metrics have shifted.

### 2.2 Numerical Animation & Visual UX
In high-stress network operations centers (NOCs), operators must identify anomalies instantly.
* **Color-Coded Thresholds:** P95 API latency is dynamically styled (Blue for nominal &lt; 150ms, Red for degraded &gt; 150ms).
* **Pulse Indicators:** CSS keyframe animations visually indicate WebSocket liveness and global system health (`HEALTHY` vs `DEGRADED`).

---

## 3. Role-Based Access Control (RBAC) Architecture
To ensure compliance with SOC2 and ISO27001 operational protocols, user actions are strictly gated by role:
* **Admin Privilege:** Can simulate chaos engineering events (`POST /api/incident/inject`).
* **Operator Privilege:** Can acknowledge and resolve alerts. Every resolution appends an immutable entry to `audit_trail` with the operator's identifier and timestamp.
* **Auditor Privilege:** UI elements that mutate server state are removed from the DOM hierarchy to prevent inadvertent execution.
