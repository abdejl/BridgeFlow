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

export default function Dashboard() {
  const { data, error, isLive } = useWaterData();

  const badgeStatus = isLive ? "live" : "syncing";

  return (
    <div className="page-fade" style={{ padding: "2rem" }}>
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
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={data[0]?.dailyTrend ?? []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                background: "rgba(255,255,255,0.9)",
                backdropFilter: "blur(8px)",
                border: "1px solid #e2e8f0",
                borderRadius: 10,
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              }}
            />
            <Line type="monotone" dataKey="b1" stroke="#0ea5e9" strokeWidth={2} name="Boutbira 1" dot={false} />
            <Line type="monotone" dataKey="b2" stroke="#10b981" strokeWidth={2} name="Boutbira 2" dot={false} />
            <Line type="monotone" dataKey="b3" stroke="#f59e0b" strokeWidth={2} name="Boutbira 3" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* AI Insights */}
      <InsightCard />
    </div>
  );
}
