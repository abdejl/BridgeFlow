// src/pages/SectorDetailPage.jsx
import { useState, useEffect } from "react";
import { useWaterData } from "../hooks/useWaterData";
import { generateSectorDetail } from "../data/mockData";
import StatusBadge from "../components/StatusBadge";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from "recharts";

const STATUS_MAP = {
  normal:   { label: "Operational", pillClass: "sector-status-pill--normal" },
  warning:  { label: "Degraded",    pillClass: "sector-status-pill--warning" },
  critical: { label: "Critical",    pillClass: "sector-status-pill--critical" },
};

export default function SectorDetailPage({ sectorId, sectorName }) {
  const { data, error, isLive } = useWaterData();
  const [detail, setDetail] = useState(null);

  const sector = data.find((s) => s.sectorId === sectorId);
  const status = STATUS_MAP[sector?.status] ?? STATUS_MAP.normal;

  // Pulse sector detail data in sync with the main data stream.
  useEffect(() => {
    setDetail(generateSectorDetail(sectorId));
    const timer = setInterval(() => {
      setDetail(generateSectorDetail(sectorId));
    }, 3000);
    return () => clearInterval(timer);
  }, [sectorId]);

  if (!sector || !detail) return null;

  const syncTime = new Date(sector.lastUpdated).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className="page-fade" style={{ padding: "2rem" }}>
      {/* ── Header ─────────────────────────────────────── */}
      <div className="sector-detail-header">
        <h1>{sectorName}</h1>
        <span className={`sector-status-pill ${status.pillClass}`}>
          <span
            className={`status-dot ${
              sector.status === "normal" ? "status-dot--live" :
              sector.status === "warning" ? "status-dot--syncing" :
              "status-dot--error"
            }`}
            style={{ position: "relative", width: 8, height: 8 }}
          />
          Status: {status.label}
        </span>
        <StatusBadge status={isLive ? "live" : "syncing"} error={error} />
      </div>

      {/* ── Key Metrics Grid (2x2) ─────────────────────── */}
      <div className="metrics-grid-2x2">
        {/* Flow Rate */}
        <div className="metric-card">
          <div className="metric-icon" style={{ background: "#eff6ff", color: "#0ea5e9" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-label">Flow Rate</span>
            <span className="metric-value">
              {sector.flowRate}
              <span className="metric-unit">L/min</span>
            </span>
          </div>
        </div>

        {/* Daily Consumption */}
        <div className="metric-card">
          <div className="metric-icon" style={{ background: "#f0fdf4", color: "#10b981" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21V5a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v16"/>
              <path d="M3 21h18"/>
              <path d="M9 7h1"/><path d="M9 11h1"/><path d="M9 15h1"/>
              <path d="M14 7h1"/><path d="M14 11h1"/><path d="M14 15h1"/>
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-label">Daily Consumption</span>
            <span className="metric-value">
              {detail.dailyConsumption}
              <span className="metric-unit">m&sup3;</span>
            </span>
          </div>
        </div>

        {/* Pressure */}
        <div className="metric-card">
          <div className="metric-icon" style={{ background: "#fef3c7", color: "#f59e0b" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v6l4 2"/>
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-label">Pressure</span>
            <span className="metric-value">
              {detail.pressure}
              <span className="metric-unit">bar</span>
            </span>
          </div>
        </div>

        {/* Last Sensor Sync */}
        <div className="metric-card">
          <div className="metric-icon" style={{ background: "#f5f3ff", color: "#8b5cf6" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
              <path d="M3 3v5h5"/>
              <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/>
              <path d="M16 16h5v5"/>
            </svg>
          </div>
          <div className="metric-info">
            <span className="metric-label">Last Sensor Sync</span>
            <span className="metric-value" style={{ fontSize: "1.3rem" }}>
              {syncTime}
            </span>
          </div>
        </div>
      </div>

      {/* ── Historical Trend Chart ─────────────────────── */}
      <div className="chart-card" style={{ marginTop: "2rem" }}>
        <h2 className="section-label" style={{ marginBottom: "1rem" }}>
          Historical Trend
        </h2>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={detail.weeklyTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "rgba(255,255,255,0.92)",
                backdropFilter: "blur(8px)",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
            <Line
              type="monotone"
              dataKey="consumption"
              stroke="#0ea5e9"
              strokeWidth={2.5}
              name="Consumption (L)"
              dot={{ r: 4, fill: "#0ea5e9" }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="flow"
              stroke="#10b981"
              strokeWidth={2}
              name="Avg Flow (L/min)"
              dot={{ r: 3, fill: "#10b981" }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Recent Alerts / Activity ────────────────────── */}
      <div className="glass-card" style={{ marginTop: "2rem" }}>
        <h2 className="section-label" style={{ marginBottom: "0.75rem" }}>
          Recent Alerts / Activity
        </h2>
        <table className="activity-table">
          <thead>
            <tr>
              <th style={{ width: "70px" }}>Time</th>
              <th>Event</th>
              <th style={{ width: "90px", textAlign: "right" }}>Type</th>
            </tr>
          </thead>
          <tbody>
            {detail.activityLogs.map((log) => (
              <tr key={log.id}>
                <td style={{ fontFamily: "monospace", fontSize: "0.8rem", color: "#64748b" }}>
                  {log.time}
                </td>
                <td>
                  <span style={{ display: "inline-flex", alignItems: "center" }}>
                    <span className={`activity-dot activity-dot--${log.type}`} />
                    {log.event}
                  </span>
                </td>
                <td style={{ textAlign: "right" }}>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.04em",
                      padding: "3px 8px",
                      borderRadius: 6,
                      color:
                        log.type === "success" ? "#059669" :
                        log.type === "warning" ? "#d97706" :
                        log.type === "error"   ? "#dc2626" :
                        "#64748b",
                      background:
                        log.type === "success" ? "#ecfdf5" :
                        log.type === "warning" ? "#fffbeb" :
                        log.type === "error"   ? "#fef2f2" :
                        "#f1f5f9",
                    }}
                  >
                    {log.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
