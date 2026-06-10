// src/pages/Dashboard.jsx
import { useWaterData } from "../hooks/useWaterData";
import SectorCard from "../components/SectorCard";
import InsightCard from "../components/InsightCard";
import StatusBadge from "../components/StatusBadge";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  CartesianGrid, ResponsiveContainer
} from "recharts";

const SECTORS = ["Boutbira 1", "Boutbira 2", "Boutbira 3"];

const SERIES = [
  { key: "b1", name: "Boutbira 1", color: "#0ea5e9" },
  { key: "b2", name: "Boutbira 2", color: "#10b981" },
  { key: "b3", name: "Boutbira 3", color: "#f59e0b" },
];

function ChartLegend() {
  return (
    <div style={{
      display: "flex",
      justifyContent: "flex-end",
      gap: "1.25rem",
      marginBottom: "0.75rem",
      flexWrap: "wrap",
    }}>
      {SERIES.map((s) => (
        <span
          key={s.key}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: "0.78rem",
            fontWeight: 600,
            color: "#475569",
          }}
        >
          <span
            style={{
              width: 10,
              height: 10,
              borderRadius: 3,
              background: s.color,
              flexShrink: 0,
            }}
          />
          {s.name}
        </span>
      ))}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;

  return (
    <div style={{
      background: "rgba(255,255,255,0.96)",
      backdropFilter: "blur(8px)",
      border: "1px solid #e2e8f0",
      borderRadius: 10,
      boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
      padding: "10px 14px",
      fontSize: "0.8rem",
    }}>
      <div style={{ fontWeight: 700, color: "#0f172a", marginBottom: 6, fontSize: "0.82rem" }}>
        {label}
      </div>
      {payload.map((entry) => {
        const series = SERIES.find((s) => s.key === entry.dataKey);
        return (
          <div
            key={entry.dataKey}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "3px 0",
            }}
          >
            <span
              style={{
                width: 8,
                height: 8,
                borderRadius: 2,
                background: entry.color,
                flexShrink: 0,
              }}
            />
            <span style={{ color: "#64748b", flex: 1 }}>{series?.name ?? entry.name}</span>
            <span style={{ fontWeight: 700, color: "#0f172a" }}>
              {entry.value.toLocaleString()} L
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard() {
  const { data, error, isLive } = useWaterData();

  const badgeStatus = isLive ? "live" : "syncing";

  const warningSectors = data.filter((s) => s.status === "warning");

  return (
    <div className="page-fade" style={{ padding: "2rem" }}>
      {/* Warning Banner */}
      {warningSectors.length > 0 && (
        <div className="warning-banner">
          <svg className="warning-banner-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
          {warningSectors.map((s) => (
            <span key={s.sectorId}>
              Warning: {s.sectorName} requires attention &mdash; Water Level at {typeof s.waterLevel === "number" ? s.waterLevel.toFixed(1) : s.waterLevel}%
            </span>
          ))}
        </div>
      )}

      {/* Header */}
      <div className="sector-header">
        <h1>Live Overview</h1>
        <StatusBadge status={badgeStatus} error={error} />
        {error && (
          <span style={{ fontSize: "0.75rem", color: "#ef4444" }}>
            Connection issue — showing cached data
          </span>
        )}
      </div>

      {/* Sector Cards */}
      <div className="cards-grid-3">
        {SECTORS.map((sector, i) => (
          <SectorCard
            key={sector}
            name={sector}
            level={data[i]?.waterLevel ?? "--"}
            flowRate={data[i]?.flowRate ?? "--"}
            status={data[i]?.status ?? "unknown"}
          />
        ))}
      </div>

      {/* Trend Chart */}
      <div className="chart-card" style={{ marginTop: "2rem" }}>
        <h2 style={{ marginBottom: "1rem", fontSize: "1rem", fontWeight: 600, color: "#334155" }}>
          Daily Consumption Trends (L)
        </h2>
        <ChartLegend />
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={data[0]?.dailyTrend ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11 }} width={40} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#cbd5e1", strokeWidth: 1 }} />
            <Line type="monotone" dataKey="b1" stroke="#0ea5e9" strokeWidth={2} name="Boutbira 1" dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="b2" stroke="#10b981" strokeWidth={2} name="Boutbira 2" dot={{ r: 3 }} activeDot={{ r: 5 }} />
            <Line type="monotone" dataKey="b3" stroke="#f59e0b" strokeWidth={2} name="Boutbira 3" dot={{ r: 3 }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI Insights */}
      <InsightCard />
    </div>
  );
}
