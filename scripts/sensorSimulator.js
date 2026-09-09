// scripts/sensorSimulator.js
// Standalone sensor simulator — behaves like future ESP32/physical sensors.
// Sends readings to the BridgeFlow backend every 5 seconds.

const API_URL = process.env.SENSOR_API_URL || "http://localhost:3000/api/readings";
const API_KEY = process.env.SENSOR_API_KEY;
const INTERVAL_MS = 5000;

if (!API_KEY) {
  console.error("Error: SENSOR_API_KEY environment variable is required.");
  console.error("Usage: SENSOR_API_KEY=your-key node scripts/sensorSimulator.js");
  process.exit(1);
}

// ── Sector baselines ──────────────────────────────────────────────
const sectors = [
  { sectorId: 1, sectorName: "Boutbira 1", waterLevel: 74.0, flowRate: 12.4 },
  { sectorId: 2, sectorName: "Boutbira 2", waterLevel: 52.0, flowRate: 9.7  },
  { sectorId: 3, sectorName: "Boutbira 3", waterLevel: 82.0, flowRate: 14.1 },
];

// ── Status logic (matches BridgeFlow mock data) ──────────────────
function getStatus(waterLevel) {
  if (waterLevel < 45) return "critical";
  if (waterLevel < 60) return "warning";
  return "normal";
}

// ── Drift: small random walk around baseline ──────────────────────
function drift(current, baseline, min, max, step) {
  const delta = (Math.random() - 0.5) * 2 * step;
  let next = current + delta;
  // Gently pull back toward baseline to avoid long-term drift.
  next += (baseline - next) * 0.05;
  return Math.round(Math.max(min, Math.min(max, next)) * 10) / 10;
}

// ── Format timestamp ──────────────────────────────────────────────
function timestamp() {
  return new Date().toTimeString().slice(0, 8);
}

// ── Build and send payload ────────────────────────────────────────
async function sendReadings() {
  const payload = sectors.map((s) => {
    s.waterLevel = drift(s.waterLevel, s.waterLevel, 0, 100, 0.5);
    s.flowRate = drift(s.flowRate, s.flowRate, 0, 50, 0.3);
    const status = getStatus(s.waterLevel);
    return { ...s, status };
  });

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-sensor-api-key": API_KEY,
      },
      body: JSON.stringify({ sectors: payload }),
    });

    const body = await res.json();

    if (!res.ok) {
      console.error(`[${timestamp()}] POST failed (${res.status}): ${body.error || res.statusText}`);
      return;
    }

    console.log(`[${timestamp()}] Sent readings successfully`);
    for (const s of payload) {
      console.log(
        `  ${s.sectorName} | Level: ${s.waterLevel}% | Flow: ${s.flowRate} | ${s.status}`
      );
    }
  } catch (err) {
    console.error(`[${timestamp()}] Connection error: ${err.message}`);
  }
}

// ── Graceful shutdown ─────────────────────────────────────────────
process.on("SIGINT", () => {
  console.log("\nStopping BridgeFlow sensor simulator...");
  process.exit(0);
});

// ── Start ─────────────────────────────────────────────────────────
console.log(`BridgeFlow sensor simulator started`);
console.log(`  Target: ${API_URL}`);
console.log(`  Interval: ${INTERVAL_MS / 1000}s`);
console.log();

sendReadings();
setInterval(sendReadings, INTERVAL_MS);
