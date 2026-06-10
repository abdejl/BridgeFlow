// src/components/SectorCard.jsx
export default function SectorCard({ name, level, flowRate, status }) {
  const statusColor = { normal: "#10b981", warning: "#f59e0b", critical: "#ef4444" };
  const color = statusColor[status] ?? "#94a3b8";

  const cardClass = status === "warning" ? "glass-card glass-card--warning" : "glass-card";

  const displayLevel = typeof level === "number" ? level.toFixed(1) : level;
  const displayFlow = typeof flowRate === "number" ? flowRate.toFixed(1) : flowRate;

  return (
    <div
      className={cardClass}
      style={{ borderTop: `4px solid ${color}` }}
    >
      <h3 style={{ margin: 0, color: "#0f172a", fontSize: "1rem", fontWeight: 600 }}>
        {name}
      </h3>

      <div style={{ marginTop: "1rem", display: "flex", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4 }}>
            Water Level
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color, lineHeight: 1 }}>
            {displayLevel}%
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: 4 }}>
            Flow Rate
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: "#334155", lineHeight: 1 }}>
            {displayFlow} <span style={{ fontSize: "0.9rem", fontWeight: 500 }}>L/m</span>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: "0.85rem",
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontSize: "0.7rem",
          fontWeight: 700,
          color,
          textTransform: "uppercase",
          letterSpacing: "0.06em",
          background: `${color}11`,
          padding: "4px 10px",
          borderRadius: 6,
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: color,
          }}
        />
        {status}
      </div>
    </div>
  );
}
