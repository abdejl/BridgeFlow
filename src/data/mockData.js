// src/data/mockData.js
// Realistic mock data generator with live pulsing simulation.

const DAILY_TREND = [
  { day: "Mon", b1: 820, b2: 650, b3: 710 },
  { day: "Tue", b1: 790, b2: 680, b3: 690 },
  { day: "Wed", b1: 850, b2: 700, b3: 730 },
  { day: "Thu", b1: 810, b2: 660, b3: 700 },
  { day: "Fri", b1: 830, b2: 690, b3: 720 },
  { day: "Sat", b1: 780, b2: 640, b3: 680 },
  { day: "Sun", b1: 800, b2: 670, b3: 700 },
];

// Sector configs define realistic baseline ranges for each sector.
const SECTOR_CONFIGS = [
  {
    id: "boutbira1",
    sectorId: 1,
    sectorName: "Boutbira 1",
    base: { waterLevel: 74, flowRate: 12.4 },
    range: { waterLevel: 3, flowRate: 1.2 },   // max fluctuation per tick
    bounds: { waterLevel: [60, 95], flowRate: [8, 18] },
    defaultStatus: "normal",
  },
  {
    id: "boutbira2",
    sectorId: 2,
    sectorName: "Boutbira 2",
    base: { waterLevel: 52, flowRate: 9.7 },
    range: { waterLevel: 4, flowRate: 0.8 },
    bounds: { waterLevel: [35, 70], flowRate: [6, 14] },
    defaultStatus: "warning",
  },
  {
    id: "boutbira3",
    sectorId: 3,
    sectorName: "Boutbira 3",
    base: { waterLevel: 82, flowRate: 14.1 },
    range: { waterLevel: 2, flowRate: 1.0 },
    bounds: { waterLevel: [70, 98], flowRate: [10, 20] },
    defaultStatus: "normal",
  },
];

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function fluctuate(current, range, bounds) {
  const delta = (Math.random() - 0.5) * 2 * range;
  return clamp(parseFloat((current + delta).toFixed(1)), bounds[0], bounds[1]);
}

function resolveStatus(waterLevel) {
  if (waterLevel < 45) return "critical";
  if (waterLevel < 60) return "warning";
  return "normal";
}

// Creates a snapshot of all three sectors with slightly pulsed values.
export function generateSnapshot(prev) {
  return SECTOR_CONFIGS.map((cfg, i) => {
    const prevSector = prev?.[i];

    const waterLevel = prevSector
      ? fluctuate(prevSector.waterLevel, cfg.range.waterLevel, cfg.bounds.waterLevel)
      : parseFloat(clamp(cfg.base.waterLevel + (Math.random() - 0.5) * cfg.range.waterLevel, cfg.bounds.waterLevel[0], cfg.bounds.waterLevel[1]).toFixed(1));

    const flowRate = prevSector
      ? fluctuate(prevSector.flowRate, cfg.range.flowRate, cfg.bounds.flowRate)
      : parseFloat(clamp(cfg.base.flowRate + (Math.random() - 0.5) * cfg.range.flowRate, cfg.bounds.flowRate[0], cfg.bounds.flowRate[1]).toFixed(1));

    return {
      id: cfg.id,
      sectorId: cfg.sectorId,
      sectorName: cfg.sectorName,
      waterLevel,
      flowRate,
      status: resolveStatus(waterLevel),
      dailyTrend: DAILY_TREND,
      lastUpdated: new Date().toISOString(),
    };
  });
}

// ── Sector Detail Mock Data ─────────────────────────────────

const WEEKLY_TREND = {
  boutbira1: [
    { week: "W1", consumption: 5820, flow: 41.0 },
    { week: "W2", consumption: 6100, flow: 39.5 },
    { week: "W3", consumption: 5950, flow: 42.5 },
    { week: "W4", consumption: 6200, flow: 40.5 },
    { week: "W5", consumption: 5780, flow: 41.5 },
    { week: "W6", consumption: 6050, flow: 39.0 },
    { week: "W7", consumption: 6180, flow: 40.0 },
  ],
  boutbira2: [
    { week: "W1", consumption: 4300, flow: 32.5 },
    { week: "W2", consumption: 4520, flow: 34.0 },
    { week: "W3", consumption: 4180, flow: 35.0 },
    { week: "W4", consumption: 4600, flow: 33.0 },
    { week: "W5", consumption: 4400, flow: 34.5 },
    { week: "W6", consumption: 4250, flow: 32.0 },
    { week: "W7", consumption: 4480, flow: 33.5 },
  ],
  boutbira3: [
    { week: "W1", consumption: 6500, flow: 35.5 },
    { week: "W2", consumption: 6780, flow: 34.5 },
    { week: "W3", consumption: 6620, flow: 36.5 },
    { week: "W4", consumption: 6900, flow: 35.0 },
    { week: "W5", consumption: 6450, flow: 36.0 },
    { week: "W6", consumption: 6700, flow: 34.0 },
    { week: "W7", consumption: 6850, flow: 35.0 },
  ],
};

const ACTIVITY_LOGS = {
  boutbira1: [
    { id: 1, time: "14:32", event: "Pump Activated",       type: "info" },
    { id: 2, time: "13:15", event: "Flow Spike Detected",   type: "warning" },
    { id: 3, time: "11:48", event: "Pressure Normalized",   type: "success" },
    { id: 4, time: "09:20", event: "Daily Calibration OK",  type: "info" },
    { id: 5, time: "08:00", event: "System Startup",        type: "info" },
  ],
  boutbira2: [
    { id: 1, time: "14:28", event: "Low Pressure Warning",  type: "warning" },
    { id: 2, time: "12:55", event: "Pump Activated",        type: "info" },
    { id: 3, time: "11:30", event: "Flow Rate Stabilized",  type: "success" },
    { id: 4, time: "10:10", event: "Sensor Reconnected",    type: "warning" },
    { id: 5, time: "08:00", event: "System Startup",        type: "info" },
  ],
  boutbira3: [
    { id: 1, time: "14:35", event: "Pressure Normalized",   type: "success" },
    { id: 2, time: "13:40", event: "Pump Activated",        type: "info" },
    { id: 3, time: "12:20", event: "Flow Spike Detected",   type: "warning" },
    { id: 4, time: "10:05", event: "Maintenance Reminder",  type: "info" },
    { id: 5, time: "08:00", event: "System Startup",        type: "info" },
  ],
};

function fluctuateDetail(base, range, min, max) {
  const delta = (Math.random() - 0.5) * 2 * range;
  return parseFloat(clamp(base + delta, min, max).toFixed(1));
}

export function generateSectorDetail(sectorId) {
  const key = `boutbira${sectorId}`;
  const configs = {
    boutbira1: { pressure: { base: 3.2, range: 0.3, min: 2.5, max: 4.0 }, dailyConsumption: { base: 865, range: 40, min: 700, max: 1000 } },
    boutbira2: { pressure: { base: 2.7, range: 0.4, min: 1.8, max: 3.5 }, dailyConsumption: { base: 640, range: 35, min: 500, max: 800 } },
    boutbira3: { pressure: { base: 3.5, range: 0.2, min: 2.8, max: 4.2 }, dailyConsumption: { base: 935, range: 45, min: 750, max: 1100 } },
  };
  const cfg = configs[key] ?? configs.boutbira1;

  return {
    pressure: fluctuateDetail(cfg.pressure.base, cfg.pressure.range, cfg.pressure.min, cfg.pressure.max),
    dailyConsumption: Math.round(fluctuateDetail(cfg.dailyConsumption.base, cfg.dailyConsumption.range, cfg.dailyConsumption.min, cfg.dailyConsumption.max)),
    weeklyTrend: WEEKLY_TREND[key] ?? WEEKLY_TREND.boutbira1,
    activityLogs: ACTIVITY_LOGS[key] ?? ACTIVITY_LOGS.boutbira1,
  };
}

/**
 * Creates a mock data stream that pulses every `intervalMs` milliseconds.
 * Returns { start, stop } so the hook controls the lifecycle.
 *
 * - start(): generates initial snapshot, begins interval, calls onUpdate.
 * - stop(): clears interval.
 */
export function createMockDataStream(onUpdate, intervalMs = 3000) {
  let timer = null;
  let snapshot = null;

  function tick() {
    snapshot = generateSnapshot(snapshot);
    onUpdate([...snapshot]);
  }

  return {
    start() {
      tick();                         // immediate first render
      timer = setInterval(tick, intervalMs);
    },
    stop() {
      if (timer !== null) {
        clearInterval(timer);
        timer = null;
      }
    },
  };
}
